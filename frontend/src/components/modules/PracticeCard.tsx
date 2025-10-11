import { useMemo, useState, useEffect, useCallback } from "react";
import Prompt from "../practice/Prompt";
import AnswerArea from "../practice/AnswerArea";
import { MCQSelector } from "../practice/MCQSelector";
import ResultBanner from "../practice/ResultBanner";
import { useProblemRunner } from "../../hooks/useProblemRunner";
import type { TExerciseSpec as ExerciseSpec } from "@shared/module";
import FillBlankRenderer from "../practice/FillBlankRenderer";
import MatchingRenderer from "../practice/MatchingRenderer";
import TrueFalseRenderer from "../practice/TrueFalseRenderer";
import OrderingRenderer from "../practice/OrderingRenderer";

type PracticeCardProps = {
  moduleSlug: string;
  exerciseSlug: string;
  exerciseSpec: ExerciseSpec; // <-- provided by parent from module.exercises
  existingProblemId?: string; // <-- optional: load existing problem instead of generating
};

export default function PracticeCard({ moduleSlug, exerciseSlug, exerciseSpec, existingProblemId }: PracticeCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  
  // NEW: State for fill-in-the-blank exercises
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<string, string>>({});
  
  // NEW: State for matching exercises
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  
  // NEW: State for true/false exercises
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | undefined>(undefined);
  
  // NEW: State for ordering exercises
  const [orderingAnswers, setOrderingAnswers] = useState<string[]>([]);

  console.log("🎴 PracticeCard rendered!");
  console.log("🎴 Props:", { moduleSlug, exerciseSlug, existingProblemId });

  const {
    loading, problem, prompt, error, result,
    setError, setResult, generate, loadExistingProblem, grade,
  } = useProblemRunner({ moduleSlug, exerciseSlug, exerciseSpec });

  // Memoize handlers to prevent unnecessary re-renders
  const handleLoadExisting = useCallback(async (problemId: string) => {
    return loadExistingProblem(problemId);
  }, [loadExistingProblem]);

  const handleGenerate = useCallback(async () => {
    return generate();
  }, [generate]);

  const handleSetError = useCallback((message: string) => {
    setError(message);
  }, [setError]);

  // NEW: Handler for fill-in-the-blank answers
  const handleBlankChange = useCallback((blankId: string, value: string) => {
    setFillBlankAnswers(prev => ({
      ...prev,
      [blankId]: value
    }));
  }, []);

  // NEW: Handler for matching answers
  const handleMatchChange = useCallback((matches: Record<string, string>) => {
    setMatchingAnswers(matches);
  }, []);
  
  // NEW: Handler for true/false answer
  const handleTrueFalseAnswerChange = useCallback((answer: boolean) => {
    setTrueFalseAnswer(answer);
  }, []);
  

  
  // NEW: Handler for ordering answers
  const handleOrderingChange = useCallback((orderedItems: string[]) => {
    console.log("🔄 Ordering changed:", orderedItems);
    setOrderingAnswers(orderedItems);
  }, []);

  // prefer the problem/ui expected format; fall back to hints in spec
  const exampleHint = useMemo(() => {
    const uiHint =
      problem?.ui?.expectedFormat ||
      exerciseSpec.params.formatHints ||
      "";
    return uiHint;
  }, [problem, exerciseSpec.params.formatHints]);

  // NEW: Function to render the appropriate exercise interface based on type
  const renderExerciseInterface = () => {
    if (!problem) return null;

    switch (problem.kind) {
      case "multiple-choice":
        return (
          <MCQSelector
            choices={problem.choices || []}
            selectedChoice={selectedChoice}
            onSelect={setSelectedChoice}
            disabled={loading}
          />
        );
      
      case "fill-in-the-blank":
        return (
          <FillBlankRenderer
            stem={problem.stem}
            blanks={problem.blanks || []}
            onBlankChange={handleBlankChange}
            disabled={loading}
            currentAnswers={fillBlankAnswers}
          />
        );
      
      case "matching":
        // Extract left and right items from matching pairs
        const leftItems = (problem.matchingPairs || []).map((pair: any) => pair.leftItem);
        const rightItems = (problem.matchingPairs || []).map((pair: any) => pair.rightItem);
        
        // Fallback to sample data if no matching pairs are provided
        const fallbackLeftItems = leftItems.length > 0 ? leftItems : ["Sample Concept 1", "Sample Concept 2", "Sample Concept 3"];
        const fallbackRightItems = rightItems.length > 0 ? rightItems : ["Sample Description 1", "Sample Description 2", "Sample Description 3"];
        
        // Shuffle the right items to randomize the matching order
        const shuffledRightItems = [...fallbackRightItems].sort(() => Math.random() - 0.5);
        
        return (
          <MatchingRenderer
            leftItems={fallbackLeftItems}
            rightItems={shuffledRightItems}
            onMatchChange={handleMatchChange}
            disabled={loading}
            currentMatches={matchingAnswers}
          />
        );
      
      case "true-false":
        // Extract statement from stem (first text block)
        const statement = problem.stem?.find(block => block.type === 'text' || block.type === 'md')?.value || 
                         problem.trueFalseData?.statement || 
                         "Statement not available";
        return (
          <TrueFalseRenderer
            statement={statement}
            onAnswerChange={handleTrueFalseAnswerChange}
            disabled={loading}
            currentAnswer={trueFalseAnswer}
          />
        );
      
      case "ordering":
        console.log("🔍 DEBUG: Rendering ordering exercise");
        console.log("🔍 DEBUG: problem.orderingItems:", problem.orderingItems);
        console.log("🔍 DEBUG: orderingAnswers:", orderingAnswers);
        return (
          <OrderingRenderer
            items={problem.orderingItems || []}
            onOrderChange={handleOrderingChange}
            disabled={loading}
            currentOrder={orderingAnswers}
          />
        );
      
      case "free-response":
      default:
        return (
          <AnswerArea
            value={userAnswer}
            onChange={setUserAnswer}
            disabled={loading}
            placeholder={problem.ui?.placeholder || "Type your answer here"}
          />
        );
    }
  };

  // NEW: Function to build the answer for grading based on exercise type
  const buildAnswerForGrading = () => {
    if (!problem) return ""; // Return empty string instead of null

    const answer = (() => {
      switch (problem.kind) {
        case "multiple-choice":
          return selectedChoice;
        case "fill-in-the-blank":
          return fillBlankAnswers;
        case "matching":
          return matchingAnswers;
        case "true-false":
          return trueFalseAnswer ?? false; // Return false as fallback if undefined
        case "ordering":
          console.log("🔍 DEBUG: Building ordering answer:", orderingAnswers);
          return orderingAnswers;
        case "free-response":
        default:
          return userAnswer;
      }
    })();
    
    console.log("🔍 DEBUG: Final answer for grading:", answer);
    return answer;
  };

  // NEW: Function to check if the current answer is valid for submission
  const isAnswerValid = () => {
    if (!problem) return false;

    switch (problem.kind) {
      case "multiple-choice":
        return selectedChoice !== "";
      case "fill-in-the-blank":
        // Check if we have any fill-in-the-blank answers
        const hasAnswers = Object.keys(fillBlankAnswers).length > 0;
        const allAnswersFilled = Object.values(fillBlankAnswers).every(answer => answer && answer.trim() !== "");
        return hasAnswers && allAnswersFilled;
      case "matching":
        return problem.matchingPairs && problem.matchingPairs.length > 0 && 
               Object.keys(matchingAnswers).length > 0;
      case "true-false":
        return trueFalseAnswer !== undefined;
      case "ordering":
        return problem.orderingItems && problem.orderingItems.length > 0 && 
               orderingAnswers.length === problem.orderingItems.length;
      case "free-response":
      default:
        return userAnswer.trim() !== "";
    }
  };

  // Load existing problem if ID is provided, or start generation
  useEffect(() => {
    console.log("🎴 PracticeCard useEffect running");
    console.log("🎴 existingProblemId:", `"${existingProblemId}"`);
    console.log("🎴 problem exists:", !!problem);
    console.log("🎴 loading:", loading);

    if (existingProblemId && !problem && !loading) {
      console.log("🎴 Loading existing problem:", existingProblemId);
      handleLoadExisting(existingProblemId).catch((err) => {
        handleSetError(err.message);
      });
    } else if (!existingProblemId && !problem && !loading && !error) {
      console.log("🎴 No existing problem ID and no error, starting automatic generation");
      // Check if generation is already in progress
      if (typeof window !== 'undefined') {
        const generationKey = `generating-${moduleSlug}-${exerciseSlug}`;
        if (sessionStorage.getItem(generationKey)) {
          console.log("🎴 Generation already in progress for this exercise, skipping");
          return;
        }
        sessionStorage.setItem(generationKey, 'true');
      }

      console.log("🎴 Calling generate()...");
      // For new problems, start generation automatically
      handleGenerate().catch((err) => {
        console.error("🎴 Automatic generation failed:", err);
        handleSetError(err.message);
      }).finally(() => {
        // Clean up the generation flag
        if (typeof window !== 'undefined') {
          const generationKey = `generating-${moduleSlug}-${exerciseSlug}`;
          sessionStorage.removeItem(generationKey);
        }
      });
    }
  }, [existingProblemId, problem, loading, error, moduleSlug, exerciseSlug, handleLoadExisting, handleGenerate, handleSetError]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--muted-text)]">Exercise</div>
          <div className="text-[var(--text)] font-medium">
            {exerciseSpec.title ?? exerciseSlug.replace(/[-_]+/g, " ")}
          </div>
        </div>
        {!problem && (
          <button
            onClick={() => generate().catch((e) => setError(e.message))}
            disabled={loading}
            className={[
              "rounded-xl bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--on-primary)]",
              "hover:bg-[var(--primary-700)] transition",
              loading ? "opacity-70" : "",
            ].join(" ")}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        )}
      </div>

      {/* Only show Prompt for non-true-false exercises since TrueFalseRenderer shows the statement */}
      {problem?.kind !== "true-false" && (
        <Prompt prompt={prompt} exampleHint={exampleHint} />
      )}

      {/* Conditional rendering: MCQ or text input */}
      {renderExerciseInterface()}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => {
            const answerToGrade = buildAnswerForGrading();
            grade(answerToGrade).catch((e) => setError(e.message));
          }}
          disabled={loading || !problem || !isAnswerValid()}
          className={[
            "rounded-xl border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)]",
            "hover:bg-[var(--bg)] transition",
            loading || !problem ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {loading ? "Checking…" : "Check"}
        </button>

        <button
          onClick={() => {
            setUserAnswer("");
            setSelectedChoice("");
            setFillBlankAnswers({}); // Clear fill-in-the-blank answers
            setMatchingAnswers({}); // Clear matching answers
            setTrueFalseAnswer(undefined); // Clear true/false answer
            setOrderingAnswers([]); // Clear ordering answers
            setResult(null);
            setError(null);
          }}
          className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted-text)] hover:bg-[var(--bg)]"
        >
          Clear
        </button>


      </div>

      <ResultBanner error={error ?? undefined} ok={result?.correct} feedback={result?.feedback} />
    </div>
  );
}
