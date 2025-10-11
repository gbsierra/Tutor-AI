import { useParams, Navigate, useOutletContext } from "react-router-dom";
import PracticeCard from "../../components/modules/PracticeCard";
import type { TExerciseSpec as ExerciseSpec } from "@shared/module";
import type { ModuleOutletContext } from "../modules/ModulePage";

export default function PracticeDetailPage() {
  const { exerciseSlug, problemId } = useParams();
  const { module } = useOutletContext<ModuleOutletContext>();

  console.log("🎯 PracticeDetailPage rendered!");
  console.log("🎯 Full URL:", window.location.href);
  console.log("🎯 Params:", { exerciseSlug, problemId });
  console.log("🎯 problemId value:", `"${problemId}"`);
  console.log("🎯 problemId === 'new':", problemId === 'new');

  console.log("🎯 Module check:", { module: !!module, exerciseSlug });
  if (!module || !exerciseSlug) {
    console.log("🎯 Redirecting to /modules - missing module or exerciseSlug");
    return <Navigate to="/modules" replace />;
  }

  const exerciseSpec: ExerciseSpec | undefined =
    module.exercises?.find((e: ExerciseSpec) => e.slug === exerciseSlug);
  console.log("🎯 Exercise spec found:", !!exerciseSpec);
  console.log("🎯 Available exercises:", module.exercises?.map((e: ExerciseSpec) => e.slug));

  if (!exerciseSpec) {
    return <Navigate to={`/modules/${module.slug}/practice`} replace />;
  }

  // If no problemId provided, redirect to problem list
  // This maintains backward compatibility but encourages the new flow
  if (!problemId) {
    return <Navigate to={`/modules/${module.slug}/practice/${exerciseSlug}`} replace />;
  }

  // If problemId is "new", let PracticeCard handle generation normally
  if (problemId === "new") {
    console.log("🎯 PracticeDetailPage: problemId is 'new', starting generation");
    return (
      <PracticeCard
        moduleSlug={module.slug}
        exerciseSlug={exerciseSlug}
        exerciseSpec={exerciseSpec}
      />
    );
  }

  // For specific problem IDs, render PracticeCard which will use the enhanced useProblemRunner
  return (
    <PracticeCard
      moduleSlug={module.slug}
      exerciseSlug={exerciseSlug}
      exerciseSpec={exerciseSpec}
      existingProblemId={problemId}
    />
  );
}
