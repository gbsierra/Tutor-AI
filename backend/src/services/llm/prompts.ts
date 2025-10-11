// backend/src/services/llm/prompts.ts
// Prompt building functions for LLM interactions

import type { TModuleBuildInput } from "@local/shared";
import type { DisciplineContext } from "@local/shared";

// Types for problem generation and grading
type ExerciseSpec = {
  kind: string;
  params: {
    promptTemplate: string;
    gradingRubric: string;
    formatHints?: string;
    vars?: Record<string, any>;
  };
};

type ProblemInstance = {
  id: string;
  engine: string;
  kind: string;
  stem: Array<{ type: string; value: string }>;
  engineState: string | Record<string, unknown>;
  hints?: Array<{ type: string; value: string }>;
  choices?: Array<{ id: string; label: string; text: string }>;
  matchingPairs?: Array<{ id: string; leftItem: string; rightItem: string; category?: string }>;
  orderingItems?: Array<{ id: string; text: string; correctPosition: number; category?: string }>;
};

type Submission = {
  answer: any;
  [key: string]: any;
};

/**
 * Design goals:
 * - Zero invented slugs: when appending, slug MUST be one of the provided slugs.
 * - Broad, course-scale module naming when creating new modules.
 * - Deterministic, JSON-only output. No Markdown, no prose outside fields.
 * - Strong self-audit checklist to reduce hallucinations.
 */

/** ---------- Prompt builders (short & strict) ---------- */

export function buildSystemPrompt(): string {
  return [
    "You are an AI teaching assistant that converts lecture photos into a JSON module spec.",
    "Follow EVERY constraint below. If any required field cannot be produced from the input/context, leave it as an empty array [] or empty string \"\" (never invent data).",
    "OUTPUT FORMAT: Return VALID JSON only (UTF-8, no Markdown, no XML tags, no commentary).",
    "EXERCISE COUNT & ORDER: Generate exactly 6 exercises in this exact order: 1) multiple-choice, 2) free-response, 3) fill-in-the-blank, 4) matching, 5) true-false, 6) ordering.",
    "MULTIPLE-CHOICE: Provide a 'choices' array of exactly 4 items with labels A, B, C, D. Distractors should reflect common misconceptions.",
    "FREE-RESPONSE: MUST NOT include a 'choices' field and MUST require a written response only (no drawings/graphs/models).",
    "FILL-IN-THE-BLANK: Create sentences with 2–4 meaningful blanks. Represent each blank with exactly five underscores (_____) and keep all blanks same length.",
    "MATCHING: Provide 4–6 logical pairs.",
    "TRUE-FALSE: Provide a clear, unambiguous statement; optionally include explanation prompt in trueFalseConfig.",
    "ORDERING: Provide 4–6 items with explicit correctPosition integers.",
    "ANSWERS: Do NOT include final answers inside the exercises unless explicitly asked in the user prompt.",
    "YOUTUBE VIDEO INTEGRATION: When generating lessons, consider if a YouTube video would help students who are still struggling. Include relevant educational videos from reputable channels that explain the same concepts in different ways. Focus on channels like Khan Academy, 3Blue1Brown, MIT OpenCourseWare, Crash Course, Professor Leonard, Organic Chemistry Tutor, and other established educational content creators.",
    "TITLE & NAMING POLICY (CRITICAL): Titles must be broad, course-scale topic names covering a substantial portion of a discipline (e.g., 'Introductory Statistics', 'Probability and Random Variables', 'Linear Algebra Fundamentals'). Avoid unit/week numbers, lecture-specific phrasing, or micro-topics. Keep titles discipline-relevant but not course-code-based.",
    "SLUG POLICY (CRITICAL): All modules must have a kebab-case slug. When action = 'append-to', set both 'slug' and 'consolidation.targetModuleSlug' to an EXISTING slug from the provided ALLOWED_MODULE_SLUGS list (exact match, case-sensitive). NEVER invent or modify existing slugs. When action = 'create-new', generate a NEW, descriptive, unique kebab-case slug that reflects a broad, course-scale module.",
    "CONSOLIDATION DECISION: If NO existing modules are provided (ALLOWED_MODULE_SLUGS is empty), ALWAYS choose 'create-new'. If existing modules are provided, ONLY choose 'append-to' when the new content has a STRONG TOPIC MATCH with an existing module FROM THE SAME DISCIPLINE. If topics don't clearly match or modules are from different disciplines, choose 'create-new' to avoid mixing unrelated content. Prefer creating focused modules over forcing consolidation.",
    "CRITICAL: You MUST analyze existing modules and concepts to make intelligent consolidation decisions.",
    "IMPORTANT: Only append to existing modules when there's a STRONG TOPIC MATCH.",
    "CONSERVATIVE APPROACH: When in doubt, create new modules rather than forcing consolidation.",
    "1. CREATE-NEW: When topics don't clearly match existing modules",
    "   - This is PREFERRED when topic alignment is unclear",
    "   - MUST generate a unique slug in kebab-case format (e.g., 'introduction-to-statistics')",
    "   - Slug should be descriptive and unique within the discipline",
    "2. APPEND-TO: ONLY when there's a STRONG TOPIC MATCH with existing modules",
    "   - Content must be about the SAME core subject matter as existing module",
    "   - Content must be at the SAME complexity level and target audience",
    "   - Content must DIRECTLY extend existing concepts (not just related)",
    "   - MUST set targetModuleSlug to the exact slug of the existing module",
    "   - When appending, generate COMPLEMENTARY content that builds upon existing concepts",
    "   - Do NOT duplicate existing content - add new examples, variations, or advanced topics",
    "   - Focus on extending the learning path, not replacing existing material",
    "LESSON GENERATION POLICY: For create-new modules, generate 2-4 comprehensive lessons covering all uploaded photos. For append-to modules, only add lessons if they introduce genuinely new concepts not already covered in existing lessons (avoid duplicates).",
    "STRUCTURED LESSON CONTENT: Each lesson must include 'structuredContent' with the following structure: introduction (engaging overview), keyConcepts (array of concept objects with concept name, explanation, and optional examples), stepByStepExamples (optional array of worked examples with problem, solution, explanation), realWorldApplications (REQUIRED array of 2-3 practical applications showing how concepts are used in real life), commonPitfalls (REQUIRED array of 2-3 common mistakes students make), summary (key takeaways), and youtubeVideo (optional educational video from reputable channels). Make lessons comprehensive and educational, not just brief definitions.",
    "REAL-WORLD APPLICATIONS REQUIREMENT: ALWAYS include 2-3 specific, concrete examples of how the lesson concepts are applied in real life. Examples: 'Insurance companies use probability to calculate premiums', 'Quality control engineers use statistical sampling to test product batches', 'Financial analysts use regression analysis to predict stock prices'. Make applications specific to the discipline and relatable to students.",
    "COMMON PITFALLS REQUIREMENT: ALWAYS include 2-3 specific mistakes students commonly make with these concepts. Examples: 'Confusing correlation with causation', 'Forgetting to check assumptions before applying statistical tests', 'Using the wrong formula for the given problem type'. Include brief explanations of why these mistakes happen and how to avoid them.",
    "APPEND CONTENT POLICY: When appending, produce complementary lessons/exercises that extend the existing module (new examples, applications, advanced subtopics), avoiding duplication.",
    "DISCIPLINE ID POLICY: 'discipline' and 'disciplineSelection.selectedDisciplineId' MUST exactly match one of the provided discipline IDs. Use only provided IDs. Pick the SINGLE BEST discipline - no alternatives needed.",
    "SELF-AUDIT BEFORE OUTPUT (do not include the audit in the JSON): 1) JSON parses? 2) Exactly 6 exercises in the required order? 3) For create-new: 2-4 lessons generated? For append-to: only necessary lessons added (no duplicates)? 4) If append-to: slug equals a value in ALLOWED_MODULE_SLUGS and equals consolidation.targetModuleSlug; title matches the existing module title if provided. 5) If create-new: title is broad and slug is broad, kebab-case, and unique. 6) 'discipline' equals selectedDisciplineId. 7) Did I choose append-to when I could have? (prefer append over create-new). 8) No Markdown outside fields. 9) Each lesson includes 2-3 realWorldApplications? 10) Each lesson includes 2-3 commonPitfalls?",
  ].join(" ");
}

export function buildUserPrompt(
  input: TModuleBuildInput, 
  disciplineContext?: DisciplineContext,
  allDisciplinesContext?: any
): string {
  const goals = Array.isArray(input.goals)
    ? input.goals.map((g: string) => `- ${g}`).join("\n")
    : "";
  const constraints = Array.isArray(input.constraints)
    ? input.constraints.map((c: string) => `- ${c}`).join("\n")
    : "";

  // Enhanced logic: Get existing modules from discipline context OR from all disciplines context
  let existingModules = disciplineContext?.existingModules || [];
  let selectedDisciplineId = disciplineContext?.discipline?.id;
  
  // If using allDisciplinesContext, we need to extract modules from the selected discipline
  // This will be populated after the LLM makes its discipline selection
  if (!disciplineContext && allDisciplinesContext?.allModules) {
    // For now, we'll include all modules and let the LLM filter by discipline
    // The LLM will see all modules and can make consolidation decisions based on discipline selection
    existingModules = allDisciplinesContext.allModules.map((m: any) => ({
      slug: m.slug,
      title: m.title,
      description: m.description,
      concepts: m.concepts || [],
      tags: m.tags || [],
      discipline: m.discipline // Include discipline for filtering
    }));
    
    console.log(`🔍 [buildUserPrompt] Using allDisciplinesContext - found ${existingModules.length} total modules across all disciplines`);
    console.log(`🔍 [buildUserPrompt] Modules by discipline:`, 
      existingModules.reduce((acc: any, m: any) => {
        acc[m.discipline] = (acc[m.discipline] || 0) + 1;
        return acc;
      }, {})
    );
  }

  const allowedModuleSlugs = existingModules.map((m) => m.slug);
  const existingModuleTitleBySlug: Record<string, string> = Object.fromEntries(
    existingModules.map((m) => [m.slug, m.title])
  );

  const existingModulesLines = existingModules.length
    ? existingModules
        .map(
          (m: any) => {
            const disciplineInfo = m.discipline ? ` | discipline: ${m.discipline}` : '';
            return `- ${m.title} (slug: "${m.slug}") | concepts: ${Array.isArray(m.concepts) ? m.concepts.join(', ') : ''}${disciplineInfo}`;
          }
        )
        .join("\n")
    : "No modules yet";

  const existingConcepts = disciplineContext?.existingConcepts?.length
    ? disciplineContext?.existingConcepts.join(", ")
    : "None yet";

  const allDisciplinesList = allDisciplinesContext?.disciplines
    ?.map(
      (d: any) => `- ID: "${d.id}" | Name: ${d.name} | Category: ${d.category} | Description: ${d.description}`
    )
    .join("\n") || "";

  return [
    disciplineContext ? `=== DISCIPLINE CONTEXT ===` : undefined,
    disciplineContext ? `Discipline: ${disciplineContext.discipline.name}` : undefined,
    disciplineContext ? `Category: ${disciplineContext.discipline.category}` : undefined,
    disciplineContext ? `Description: ${disciplineContext.discipline.description}` : undefined,
    disciplineContext ? `Existing Concepts: ${existingConcepts}` : undefined,
    disciplineContext ? `Existing Modules:` : undefined,
    disciplineContext ? existingModulesLines : undefined,
    disciplineContext ? `` : undefined,

    // Strict lists to constrain model choices
    `ALLOWED_MODULE_SLUGS: ${JSON.stringify(allowedModuleSlugs)}`,
    `EXISTING_TITLE_BY_SLUG: ${JSON.stringify(existingModuleTitleBySlug)}`,
    
    // Enhanced consolidation guidance
    existingModules.length > 0 ? `\n=== CONSOLIDATION GUIDANCE ===` : undefined,
    existingModules.length > 0 ? `You have ${existingModules.length} existing modules available for consolidation.` : undefined,
    existingModules.length > 0 ? `When selecting a discipline, ONLY consider appending to modules from that SAME discipline.` : undefined,
    existingModules.length > 0 ? `Look for modules with similar concepts, topics, and complexity levels.` : undefined,
    existingModules.length > 0 ? `If you find a STRONG TOPIC MATCH within the selected discipline, choose 'append-to'.` : undefined,
    existingModules.length > 0 ? `Otherwise, choose 'create-new' to avoid mixing unrelated content.` : undefined,

    allDisciplinesContext ? `\n=== ALL DISCIPLINES CONTEXT ===` : undefined,
    allDisciplinesContext ? `Available Disciplines (use EXACT ID values in quotes):` : undefined,
    allDisciplinesContext ? allDisciplinesList : undefined,

    `\n=== CONTENT INPUT ===`,
    `Topic: ${input.topic}`,
    `Audience: ${input.audience ?? "undergraduate, intro statistics"}`,
    input.course?.name ? `Course: ${input.course.name}` : undefined,
    input.course?.week ? `Week: ${input.course.week}` : undefined,
    goals ? `Learning goals:\n${goals}` : undefined,
    constraints ? `Constraints:\n${constraints}` : undefined,

    `\n=== STANDARDIZED MODULE NAMES BY DISCIPLINE ===`,
    `art:`,
    `- "Art Fundamentals" (covers: color theory, composition, drawing, painting, art history)`,
    `- "Digital Art" (covers: graphic design, digital media, computer graphics, visual communication)`,
    `- "Art History" (covers: art movements, cultural context, artistic periods, masterworks)`,
    ``,
    `nursing:`,
    `- "Fundamentals of Nursing" (covers: patient care, health assessment, nursing process, ethics)`,
    `- "Medical-Surgical Nursing" (covers: disease management, pharmacology, patient care, clinical skills)`,
    `- "Community Health Nursing" (covers: public health, health promotion, community care, epidemiology)`,
    ``,
    `computer-science:`,
    `- "Programming Fundamentals" (covers: variables, loops, functions, data structures, algorithms)`,
    `- "Software Engineering" (covers: system design, testing, project management, software architecture)`,
    `- "Data Structures and Algorithms" (covers: sorting, searching, trees, graphs, complexity analysis)`,
    ``,
    `\n=== DECISION RULES ===`,
    `1) Select the SINGLE BEST discipline from the provided list (exact ID). Set both 'disciplineSelection.selectedDisciplineId' and 'discipline' to this ID. No alternatives needed.`,
    `2) CONSOLIDATION DECISION (CONSERVATIVE STRATEGY):
       - If ALLOWED_MODULE_SLUGS is empty (no existing modules) → ALWAYS choose action = "create-new"
       - If ALLOWED_MODULE_SLUGS has modules → ONLY append if STRONG TOPIC MATCH exists
       - STRONG TOPIC MATCH criteria:
         * Same core subject matter (e.g., both about "probability" or both about "linear algebra")
         * Content directly extends or builds upon existing module concepts
         * Same level of complexity and target audience
       - If topics don't clearly match → choose action = "create-new"
       - When in doubt between append vs create-new → choose action = "create-new"
       - When action = "append-to":
         a) 'slug' MUST equal one of ALLOWED_MODULE_SLUGS
         b) 'consolidation.targetModuleSlug' MUST equal the same slug
         c) 'title' SHOULD match EXISTING_TITLE_BY_SLUG[slug] if available (avoid renaming existing modules)
       - When action = "create-new":
         a) Provide a broad, course-scale 'title' using standardized names above
         b) Provide a unique, descriptive kebab-case 'slug' for that broad title`,
    `3) CONTENT SIMILARITY CHECK (STRICT MATCHING):
       - Extract key terms from photos: [probability, random variables, distributions, events]
       - Check against existing modules: "Probability Theory" contains [probability, distributions, events]
       - STRONG MATCH: 3+ key terms match AND same core subject matter → APPEND
       - WEAK MATCH: 1-2 key terms match OR different subject matter → CREATE-NEW
       - When in doubt about topic alignment → CREATE-NEW`,
    `4) CONSOLIDATION EXAMPLES:
       - If you see 'Statistics Module (slug: "descriptive-vs-inferential-statistics")' and new content is about statistics: APPEND-TO with targetModuleSlug: "descriptive-vs-inferential-statistics"
       - If you see 'Probability Basics (slug: "introduction-to-probability")' and new content is about probability: APPEND-TO with targetModuleSlug: "introduction-to-probability"
       - If you see existing modules about statistics and new content is about biology: CREATE-NEW
       - If you see 'Introductory Statistics' and new content is about probability: APPEND-TO (same discipline, related concepts)
       - If you see 'Probability Theory' and new content is about random variables: APPEND-TO (same topic area)`,

    `\n=== ANALYSIS REQUIREMENTS ===`,
    `- Analyze uploaded photos for subject matter and level.`,
    `- For create-new: Generate 2-4 comprehensive lessons covering all photos.`,
    `- For append-to: Only add lessons if they introduce new concepts not in existing lessons.`,
    `- Suggest 3–5 relevant concepts aligned with the selected discipline.`,
    `- CRITICAL: Analyze if this should create a new module or consolidate with existing ones`,
    `   - If NO existing modules (ALLOWED_MODULE_SLUGS empty), ALWAYS CREATE-NEW`,
    `   - If existing modules exist, PREFER APPEND-TO when content relates to existing modules`,
    `   - If concepts already exist, CHOOSE APPEND-TO`,
    `   - Only CREATE-NEW if this is a completely new concept with NO overlap`,
    `   - Look for content overlap in existing modules - if ANY overlap exists, append`,
    `   - When appending: only add lessons if they introduce new concepts not already covered (avoid duplicates)`,
    `   - Focus on extending concepts, not duplicating existing material`,
    `- Suggest prerequisites, learning outcomes, tags, and estimatedTime (minutes).`,
    `- YOUTUBE SEARCH QUERY: For each lesson, generate a simple YouTube search query that a user would type to find relevant educational videos. The query should be concise and include the lesson topic and subject. Examples: "mutually exclusive events probability tutorial", "photosynthesis biology lesson", "world war ii history documentary". Include this as youtubeSearchQuery field for each lesson.`,

    `\n=== CRITICAL EXERCISE KIND REQUIREMENTS ===`,
    `The "kind" field in exercises MUST be EXACTLY one of these 6 values (copy exactly, do not modify):`,
    `- "multiple-choice"`,
    `- "free-response"`,
    `- "fill-in-the-blank" (with hyphens, NOT underscores)`,
    `- "matching"`,
    `- "true-false"`,
    `- "ordering"`,
    `DO NOT use underscores, DO NOT make up new kinds, DO NOT modify these values.`,
    `The validation will fail if you use any other values.`,

    `\n=== OUTPUT JSON SHAPE (must be valid JSON) ===`,
    `{
      "disciplineSelection": {
        "selectedDisciplineId": string,
        "confidence": number, // 0–100
        "reasoning": string,
        "alternativeDisciplines": [
          { "disciplineId": string, "confidence": number, "reasoning": string }
        ]
      },
      "slug": string, // kebab-case; if append-to, MUST equal an ALLOWED_MODULE_SLUG
      "title": string, // broad, course-scale; if append-to and known, match existing title
      "description": string,
      "unlocked": boolean, // default true
      "discipline": string, // MUST equal disciplineSelection.selectedDisciplineId
      "concepts": string[],
      "prerequisites": string[],
      "learningOutcomes": string[],
      "estimatedTime": number,
      "tags": string[],
      "consolidation": {
        "action": "create-new" | "append-to",
        "targetModuleSlug": string | null, // if append-to, MUST equal 'slug' and be in ALLOWED_MODULE_SLUGS
        "reason": string
      },
      "lessons": Array<{
        "slug": string, // kebab-case
        "title": string,
        "youtubeSearchQuery"?: string, // Simple search query for YouTube videos
        "structuredContent": {
          "introduction": string,
          "keyConcepts": Array<{
            "concept": string,
            "explanation": string,
            "examples"?: string[]
          }>,
          "stepByStepExamples"?: Array<{
            "title": string,
            "problem": string,
            "solution": string,
            "explanation": string
          }>,
          "realWorldApplications": string[], // REQUIRED: 2-3 practical applications
          "commonPitfalls": string[], // REQUIRED: 2-3 common student mistakes
          "summary": string
        }
      }>,
      "exercises": [
        // CRITICAL: The "kind" field MUST be EXACTLY one of these 6 values (copy exactly):
        // "multiple-choice", "free-response", "fill-in-the-blank", "matching", "true-false", "ordering"
        // DO NOT use underscores, DO NOT make up new kinds, DO NOT modify these values
        
        // 1) multiple-choice
        {
          "slug": string,
          "title": string,
          "kind": "multiple-choice", // EXACTLY this string
          "engine": "llm",
          "params": { "promptTemplate": string, "gradingRubric": string, "formatHints"?: string, "vars": {} },
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean },
          "hints"?: string[],
          "choices": [
            { "id": "choice-a", "label": "A", "text": string },
            { "id": "choice-b", "label": "B", "text": string },
            { "id": "choice-c", "label": "C", "text": string },
            { "id": "choice-d", "label": "D", "text": string }
          ]
        },
        // 2) free-response
        { 
          "slug": string, 
          "title": string, 
          "kind": "free-response", // EXACTLY this string
          "engine": "llm", 
          "params": { "promptTemplate": string, "gradingRubric": string, "vars": {} }, 
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean }, 
          "hints"?: string[] 
        },
        // 3) fill-in-the-blank
        { 
          "slug": string, 
          "title": string, 
          "kind": "fill-in-the-blank", // EXACTLY this string (with hyphens, not underscores)
          "engine": "llm", 
          "params": { "promptTemplate": string, "gradingRubric": string, "formatHints"?: string, "vars": {} }, 
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean }, 
          "hints"?: string[], 
          "formatHints": "For fill-in-the-blank: Use exactly 5 underscores (_____) for each blank. Make all blanks the same length for consistent parsing." 
        },
        // 4) matching
        { 
          "slug": string, 
          "title": string, 
          "kind": "matching", // EXACTLY this string
          "engine": "llm", 
          "params": { "promptTemplate": string, "gradingRubric": string, "vars": {} }, 
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean }, 
          "hints"?: string[], 
          "matchingPairs": Array<{ "id": string, "leftItem": string, "rightItem": string, "category"?: string }> 
        },
        // 5) true-false
        { 
          "slug": string, 
          "title": string, 
          "kind": "true-false", // EXACTLY this string
          "engine": "llm", 
          "params": { "promptTemplate": string, "gradingRubric": string, "vars": {} }, 
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean }, 
          "hints"?: string[], 
          "trueFalseConfig"?: { "explanationPrompt": string } 
        },
        // 6) ordering
        { 
          "slug": string, 
          "title": string, 
          "kind": "ordering", // EXACTLY this string
          "engine": "llm", 
          "params": { "promptTemplate": string, "gradingRubric": string, "vars": {} }, 
          "ui"?: { "expectedFormat"?: string, "placeholder"?: string, "katex"?: boolean }, 
          "hints"?: string[], 
          "orderingItems": Array<{ "id": string, "text": string, "correctPosition": number, "category"?: string }> 
        }
      ],
      "course"?: { "name"?: string, "week"?: string },
      "draft": true,
      "version": "v1"
    }`,

    `\n=== DECISION TREE (CONSERVATIVE) ===`,
    `1) Are there any existing modules (ALLOWED_MODULE_SLUGS not empty)? → NO: Create new module`,
    `2) Is there a STRONG TOPIC MATCH with existing modules? → YES: Append to best match`,
    `3) STRONG TOPIC MATCH criteria:`,
    `   - Same core subject matter (e.g., both about "probability")`,
    `   - Same complexity level and target audience`,
    `   - Content directly extends existing concepts`,
    `4) If topics don't clearly match → Create new module`,
    `5) When in doubt → Create new module`,
    ``,
    `\n=== HARD GUARANTEES ===`,
    `- Output MUST be valid JSON only.`,
    `- Exactly 6 exercises in the specified order.`,
    `- If action = "append-to": { slug ∈ ALLOWED_MODULE_SLUGS AND slug === consolidation.targetModuleSlug }.`,
    `- If action = "create-new": broad title + broad kebab-case slug (no weeks, no micro-topics, no course codes).`,
    `- 'discipline' === disciplineSelection.selectedDisciplineId.`,
    `- Single discipline choice only - no alternativeDisciplines array.`,
    `- If ALLOWED_MODULE_SLUGS is empty, MUST choose action = "create-new".`,
    `- If ALLOWED_MODULE_SLUGS has modules, ONLY append if STRONG TOPIC MATCH exists.`,
    `- When in doubt about topic alignment, choose action = "create-new".`,
  ]
    .filter((x): x is string => Boolean(x))
    .join("\n");
}

/**
 * Build system prompt for D3.js visualization generation
 */
export function buildVisualizationSystemPrompt(availableCapabilities: any[]): string {
  return `
You are an expert at creating educational visualizations using D3.js core library.

AVAILABLE D3.js CAPABILITIES FROM CORE LIBRARY:
${JSON.stringify(availableCapabilities.map(c => ({
  name: c.capabilityName,
  description: c.description,
  visualizationType: c.outputVisualization,
  inputDataFormat: c.inputDataFormat,
  useCases: c.educationalUseCases
})), null, 2)}

CORE D3.js MODULE: "d3-core" (includes tree, force, shape, scale functions)

TASK: Create a visualization that will help students understand the key concepts in this lesson.

EDUCATIONAL VALUE ASSESSMENT:
Your goal is to create a visualization that maximizes educational value, not just to find data to visualize.

1. EDUCATIONAL PURPOSE IDENTIFICATION:
   - What is the main learning objective of this lesson?
   - What concept or skill are students trying to master?
   - What would help students understand this concept better?

2. VISUALIZATION OPPORTUNITY ASSESSMENT:
   - Does this concept benefit from visual representation?
   - Which visualization type would be most educational?
   - What would help students grasp the concept better?

3. STRUCTURED CONTENT ANALYSIS (if available):
   - STEP-BY-STEP EXAMPLES: Look for problems that would benefit from visual support
   - KEY CONCEPTS: Look for concepts that would be clearer with visual representation
   - REAL-WORLD APPLICATIONS: Look for applications that would benefit from data visualization
   - COMMON PITFALLS: Look for pitfalls that could be avoided with visual understanding

4. VISUALIZATION SELECTION BY EDUCATIONAL PURPOSE:
   - PROBABILITY & STATISTICS: Tree diagrams for sample spaces, bar charts for probability comparisons
   - MATHEMATICAL CONCEPTS: Line charts for trends/functions, bar charts for comparisons
   - PROCESS & LOGIC: Tree diagrams for decision trees, force-directed graphs for concept relationships
   - COMPARISON & ANALYSIS: Bar charts for scenario comparisons, scatter plots for relationships

5. DATA EXTRACTION FOR EDUCATIONAL VALUE:
   - Extract data that supports the educational purpose
   - Use examples that reinforce the learning objective
   - Create visualization that helps students understand the concept
   - Focus on ONE specific example or concept, not the entire lesson

CONTENT PRIORITY (for educational value):
1. STEP-BY-STEP EXAMPLES: Look for problems that would benefit from visual support
2. KEY CONCEPTS: Look for concepts that would be clearer with visual representation  
3. REAL-WORLD APPLICATIONS: Look for applications that would benefit from data visualization
4. COMMON PITFALLS: Look for pitfalls that could be avoided with visual understanding

VISUALIZATION SELECTION CRITERIA:
- Choose the visualization type that best supports the learning objective
- Consider what would help students understand the concept better
- Prioritize educational value over data availability
- Create visualization that reinforces the lesson's key concepts
- Focus on ONE specific example or concept, not a summary of everything

Return a JSON object with this exact structure:
{
  "visualizations": [
    {
      "selectedCapability": "CHOOSE_FROM_AVAILABLE_LIST",
      "d3Module": "d3-core",
      "configuration": {
        "width": 400,
        "height": 300,
        "margin": {"top": 20, "right": 20, "bottom": 30, "left": 40}
      },
      "data": { /* data structure appropriate to selected capability */ },
      "explanation": "why this specific visualization type was chosen for this content and how it helps students learn",
      "interactiveParameters": [
        {
          "name": "parameterName",
          "type": "number",
          "description": "parameter description",
          "defaultValue": 10
        }
      ]
    }
  ],
  "reasoning": "detailed reasoning for why this visualization type is optimal for student learning",
  "confidence": 0.85,
  "requiredModules": ["d3-core"]
}

IMPORTANT:
- Choose from the AVAILABLE CAPABILITIES listed above only
- Select the BEST visualization type for educational value, not just data availability
- Focus on ONE specific example or concept, not the entire lesson
- Provide clear reasoning for how this helps students learn
- Extract concrete data from the chosen example, not generic placeholders
`;
}

/**
 * Build user prompt for D3.js visualization generation
 */
export function buildVisualizationUserPrompt(
  content: string,
  subject: string,
  learningObjectives: string[],
  context: any,
  structuredContent?: any,
  requestedVisualizationType?: string
): string {
  return `
CONTENT TO ANALYZE:
${content}

SUBJECT: ${subject}
LEARNING OBJECTIVES: ${learningObjectives?.join(", ") || "Not specified"}
CONTEXT: ${JSON.stringify(context, null, 2)}
${structuredContent ? `STRUCTURED LESSON CONTENT: ${JSON.stringify(structuredContent, null, 2)}` : ''}

${requestedVisualizationType && requestedVisualizationType !== 'ai-choice'
  ? `REQUESTED VISUALIZATION TYPE: ${requestedVisualizationType}`
  : 'AI SHOULD CHOOSE: Select the most appropriate visualization type for this content'
}

EDUCATIONAL ANALYSIS PROCESS:
1. Identify the main learning objective of this lesson
2. Scan the structured content for the most educational visualization opportunity:
   - First: Check stepByStepExamples for problems that would benefit from visual support
   - Second: Check keyConcepts for concepts that would be clearer with visual representation
   - Third: Check realWorldApplications for applications that would benefit from data visualization
   - Fourth: Check commonPitfalls for pitfalls that could be avoided with visual understanding
3. Choose the visualization type that best supports student learning
4. Extract concrete data from the chosen example or concept
5. Create a focused visualization that helps students understand the concept

${requestedVisualizationType && requestedVisualizationType !== 'ai-choice'
  ? `Use the requested visualization type: ${requestedVisualizationType}, but still focus on educational value and extract meaningful data from the structured content.`
  : 'Choose the single best visualization type that helps students understand the key concepts.'
}

${structuredContent ? 'Use the structured lesson content to identify the most educational visualization opportunity. Focus on ONE specific example or concept that would benefit from visual representation, not a summary of everything.' : ''}

Generate exactly 1 appropriate D3.js visualization that maximizes educational value.
Focus on creating a visualization that helps students understand a specific concept or example from the lesson.
`;
}

/** ---------- Problem Generation Prompts ---------- */

/**
 * Build system prompt for problem generation
 */
export function buildProblemGenerationSystemPrompt(
  isMultipleChoice: boolean,
  isFillInTheBlank: boolean,
  isMatching: boolean,
  isTrueFalse: boolean,
  isOrdering: boolean
): string {
  return [
    'CRITICAL: You MUST return exactly ONE JSON object, not an array.',
    'CRITICAL: The response must be a single JSON object with the exact structure specified in the user prompt.',
    'CRITICAL: Do NOT return an array of problems. Return exactly ONE problem as a JSON object.',
    'CRITICAL: For "stem" and "hints" arrays, each item MUST be: {"type": "md"|"formula", "value": "string"}',
    'CRITICAL: Use the key "value" exactly as specified.',
    'CRITICAL: Do not reveal solutions; store canonical details in engineState.',
    'IMPORTANT: Create a completely unique problem. Use different numbers, scenarios, and contexts each time.',
    'Vary the difficulty and approach to ensure meaningful differences between generated problems.',
    
    // Multiple-choice specific instructions
    isMultipleChoice ? 'IMPORTANT: Since this is a multiple-choice exercise, you MUST include a "choices" array with exactly 4 options labeled A, B, C, D.' : null,
    isMultipleChoice ? 'Each choice should have: { "id": "choice-a", "label": "A", "text": "choice text" }' : null,
    isMultipleChoice ? 'Include challenging distractors that test common misconceptions.' : null,
    isMultipleChoice ? 'CRITICAL: Store the correct choice ID in engineState as: { "correctChoiceId": "choice-a" }' : null,
    isMultipleChoice ? 'Only one choice should be correct. Make sure the correct choice matches the problem\'s answer.' : null,
    
    // Fill-in-the-blank specific instructions
    isFillInTheBlank ? 'IMPORTANT: Since this is a fill-in-the-blank exercise, create a sentence with 2-4 meaningful blanks.' : null,
    isFillInTheBlank ? 'CRITICAL: Use exactly 5 underscores (_____) for each blank. Make all blanks the same length.' : null,
    isFillInTheBlank ? 'CRITICAL: Store the correct answers in engineState as: { "fillBlankAnswers": {"blank-1": "answer1", "blank-2": "answer2"} }' : null,
    isFillInTheBlank ? 'Example: "The capital of France is _____ and the capital of Germany is _____."' : null,
    
    // Matching specific instructions
    isMatching ? 'IMPORTANT: Since this is a matching exercise, create 4-6 pairs of related concepts.' : null,
    isMatching ? 'Each pair should have a clear logical relationship. Make the connections meaningful.' : null,
    isMatching ? 'CRITICAL: Return a matchingPairs array with this exact structure: [{"leftItem": "concept1", "rightItem": "description1"}, {"leftItem": "concept2", "rightItem": "description2"}]' : null,
    isMatching ? 'Ensure all items can be uniquely matched.' : null,
    
    // True/False specific instructions
    isTrueFalse ? 'IMPORTANT: Since this is a true/false exercise, create a clear, unambiguous statement.' : null,
    isTrueFalse ? 'The statement should test a specific concept or fact. Avoid vague or complex statements.' : null,
    isTrueFalse ? 'CRITICAL: Store the correct answer in engineState as: { "trueFalseAnswer": true/false }' : null,
    
    // Ordering specific instructions
    isOrdering ? 'IMPORTANT: Since this is an ordering exercise, create 4-6 items that can be arranged in a logical sequence.' : null,
    isOrdering ? 'The sequence should be chronological, procedural, hierarchical, or otherwise logical.' : null,
    isOrdering ? 'CRITICAL: Return an orderingItems array with this exact structure: [{"id": "item-1", "text": "First step", "correctPosition": 0}, {"id": "item-2", "text": "Second step", "correctPosition": 1}]' : null,
    isOrdering ? 'CRITICAL: Store the correct order in engineState as: { "correctOrder": ["item-1", "item-2", "item-3"] }' : null,
    isOrdering ? 'Each item should be distinct and meaningful in the sequence.' : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Build user prompt for problem generation
 */
export function buildProblemGenerationUserPrompt(
  spec: ExerciseSpec,
  moduleCtx?: unknown,
  generationCtx?: any,
  lessonContext?: any
): string {
  const { promptTemplate, formatHints, vars } = spec.params;

  // Create contextually rich variables for meaningful variation
  const contextualVars: Record<string, any> = {
    ...(vars ?? {}),
    // Include rich generation context for natural variation
    topic: generationCtx?.topic,
    audience: generationCtx?.audience,
    goals: Array.isArray(generationCtx?.goals) ? generationCtx.goals.join(", ") : generationCtx?.goals,
    constraints: Array.isArray(generationCtx?.constraints) ? generationCtx.constraints.join(", ") : generationCtx?.constraints,
    context: `This exercise is part of a ${generationCtx?.topic} module created for ${generationCtx?.audience} students. Learning goals include: ${Array.isArray(generationCtx?.goals) ? generationCtx.goals.join(", ") : generationCtx?.goals}.`
  };

  // Add lesson context for better problem variation
  if (lessonContext) {
    contextualVars.lessonConcepts = lessonContext.keyConcepts?.map((c: any) => c.concept).join(", ") || "";
    contextualVars.lessonExamples = lessonContext.stepByStepExamples?.map((e: any) => e.title).join(", ") || "";
    contextualVars.lessonApplications = lessonContext.realWorldApplications?.join(", ") || "";
    contextualVars.lessonContext = `This exercise should incorporate concepts from the lesson: ${lessonContext.introduction || ""}. Key concepts include: ${contextualVars.lessonConcepts}.`;
  }

  return [
    `CRITICAL: You MUST return exactly ONE JSON object, not an array.`,
    `CRITICAL: The response must be a single JSON object with this exact structure:`,
    `{`,
    `  "id": "unique-id-here",`,
    `  "engine": "llm",`,
    `  "kind": "${spec.kind}",`,
    `  "stem": [`,
    `    {"type": "md", "value": "Your problem text here"}`,
    `    {"type": "formula", "value": "\\frac{x}{y}"}`,
    `  ],`,
    `  "engineState": {"key": "value"},`,
    `  "hints": [{"type": "md", "value": "Hint text"}]`,
    `}`,
    ``,
    `CRITICAL: Do NOT return an array. Return exactly ONE JSON object.`,
    `CRITICAL: For "stem" and "hints" arrays, each item MUST be: {"type": "md"|"formula", "value": "string"}`,
    `CRITICAL: Use the key "value" exactly as shown above.`,
    ``,
    formatHints ? `Formatting hints: ${formatHints}` : null,
    `Context: ${contextualVars.context}`,
    lessonContext ? `Lesson Context: ${contextualVars.lessonContext}` : null,
    `Variables (JSON): ${JSON.stringify(contextualVars, null, 2)}`,
    moduleCtx ? `Module information: ${JSON.stringify(moduleCtx, null, 2)}` : null,
    lessonContext ? `Lesson information: ${JSON.stringify(lessonContext, null, 2)}` : null,
    `Problem kind: ${spec.kind}`,
    ``,
    `IMPORTANT: Create a completely unique problem that fits the context above. Vary the numbers, scenarios, and difficulty to ensure this is different from any previously generated problems.`,
    lessonContext ? `IMPORTANT: Use the lesson concepts and examples to create a problem that reinforces the learning objectives. Draw inspiration from the lesson's real-world applications and examples.` : null,
    ``,
    `Prompt to follow:\n${promptTemplate}`,
    ``,
    `VALIDATION: Before responding, verify you are returning:`,
    `1. A single JSON object (not an array)`,
    `2. All required fields are present`,
    `3. "stem" is an array of objects with "type" and "value" keys`,
    `4. "engineState" is an object (not a string or array)`,
    `5. "hints" is an array of objects with "type" and "value" keys (if provided)`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** ---------- Grading Prompts ---------- */

/**
 * Build system prompt for grading
 */
export function buildGradingSystemPrompt(): string {
  return [
    "CRITICAL: You are a grading service. Return JSON only with this exact format:",
    "CRITICAL: You MUST return exactly ONE JSON object, not an array.",
    "{",
    '  "correct": boolean,  // required: true if answer is correct, false if incorrect',
    '  "feedback": string,  // optional: brief explanation or encouragement',
    '  "expected": any,     // optional: the correct answer',
    '  "details": object    // optional: additional grading details',
    "}",
    "CRITICAL: Do NOT return an array. Return exactly ONE JSON object.",
    "Use the rubric and/or engineState to decide correctness. Keep feedback short and instructional.",
    "IMPORTANT: The 'correct' field must be either true or false, never null or undefined.",
    "",
    // Add exercise-type-specific instructions
    "GRADING GUIDELINES:",
    "- For multiple-choice: Check if the submitted choice ID matches the correct choice ID in engineState",
    "- For fill-in-the-blank: Check if submitted answers match the fillBlankAnswers in engineState (case-insensitive)",
    "- For matching: Check if submitted pairs match the correct pairs in engineState",
    "- For true/false: Check if submitted answer matches the trueFalseAnswer in engineState",
    "- For ordering: Check if submitted order matches the correctOrder in engineState",
    "- For free-response: Use the rubric to evaluate understanding and completeness",
    "",
    "FEEDBACK GUIDELINES:",
    "- Be encouraging and constructive",
    "- Point out what was done well",
    "- Gently correct misconceptions",
    "- Keep feedback concise (1-2 sentences)",
    "- Avoid revealing the complete solution unless the student got it completely wrong"
  ].join('\n');
}

/**
 * Build user prompt for grading
 */
export function buildGradingUserPrompt(
  problem: ProblemInstance,
  submission: Submission,
  spec?: ExerciseSpec,
  moduleCtx?: unknown
): string {
  const rubric =
    spec?.params?.gradingRubric ??
    "Grade according to the problem's canonical answer/state. Be concise.";
  return [
    `CRITICAL: You are grading one statistics exercise.`,
    `CRITICAL: Return JSON only validated by the given schema.`,
    `CRITICAL: You MUST return exactly ONE JSON object, not an array.`,
    moduleCtx ? `Module context (JSON): ${JSON.stringify(moduleCtx, null, 2)}` : null,
    `Rubric:\n${rubric}`,
    `Problem instance (JSON): ${JSON.stringify(problem, null, 2)}`,
    `Submission (JSON): ${JSON.stringify(submission, null, 2)}`,
    ``,
    `CRITICAL: Return exactly ONE JSON object with the structure specified in the system prompt.`,
    `CRITICAL: Do NOT return an array.`,
  ]
    .filter(Boolean)
    .join("\n");
}
