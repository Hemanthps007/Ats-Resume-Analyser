import { MarketRole, MarketSkill } from "./rolesData";
import { predictMlAtsScore } from "./ml/atsModel";

export interface SkillMatchResult {
  name: string;
  category: "core" | "cloud_data" | "tools_arch" | "soft_skills";
  importance: "critical" | "high" | "bonus";
  match: boolean;
  suggestedBullet?: string;
}

export interface MetricFinding {
  type: "percentage" | "currency" | "scale" | "performance";
  snippet: string;
}

export interface SectionHealth {
  name: string;
  present: boolean;
  notes: string;
}

export interface AtsDiagnostics {
  overallScore: number;
  ratingTier: "Exceptional" | "Competitive" | "Moderate" | "Needs Optimization";
  ratingColor: string;
  summaryFeedback: string;
  pillarScores: {
    keywordMatch: number;
    quantifiedImpact: number;
    structuralHealth: number;
    actionVerbs: number;
  };
  skills: SkillMatchResult[];
  matchedSkillsCount: number;
  totalSkillsCount: number;
  criticalMissing: string[];
  metricsFound: MetricFinding[];
  sections: SectionHealth[];
  strongVerbsFound: string[];
  weakPhrasesFound: string[];
  recommendations: {
    category: "Keyword" | "Metrics" | "Structure" | "Verbs";
    priority: "High" | "Medium" | "Low";
    title: string;
    description: string;
  }[];
}

// Synonyms and aliases dictionary for intelligent keyword matching
const SYNONYMS_MAP: Record<string, string[]> = {
  "react": ["react", "react.js", "reactjs", "react 18", "react 19"],
  "next.js": ["next.js", "nextjs", "next 13", "next 14", "next 15", "app router"],
  "typescript": ["typescript", "ts"],
  "javascript": ["javascript", "js", "es6", "es6+"],
  "tailwind css": ["tailwind", "tailwindcss", "tailwind css"],
  "node.js": ["node.js", "nodejs", "node"],
  "postgresql": ["postgresql", "postgres", "psql", "pg"],
  "docker": ["docker", "dockerfile", "containerization", "containers"],
  "kubernetes": ["kubernetes", "k8s", "kubectl", "helm"],
  "aws": ["aws", "amazon web services", "s3", "ec2", "lambda", "ecs", "eks"],
  "gcp": ["gcp", "google cloud", "google cloud platform", "bigquery"],
  "azure": ["azure", "microsoft azure"],
  "python": ["python", "python3", "py"],
  "pytorch": ["pytorch", "torch"],
  "tensorflow": ["tensorflow", "tf", "keras"],
  "rag": ["rag", "retrieval-augmented generation", "retrieval augmented generation", "vector search"],
  "llms": ["llm", "llms", "large language model", "large language models", "generative ai", "genai", "gpt"],
  "vector databases": ["vector db", "vector database", "pinecone", "chroma", "chromadb", "qdrant", "weaviate", "pgvector"],
  "langchain": ["langchain", "llamaindex", "langgraph"],
  "graphql": ["graphql", "apollo", "apollo client"],
  "ci/cd": ["ci/cd", "ci cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
  "state management": ["zustand", "redux", "redux toolkit", "mobx", "tanstack query", "react query"],
  "testing": ["vitest", "jest", "playwright", "cypress", "selenium", "unit testing", "e2e testing"],
  "design systems": ["design system", "design systems", "figma", "storybook", "design tokens"],
  "core web vitals": ["web vitals", "core web vitals", "lcp", "cls", "fid", "inp", "lighthouse"],
  "accessibility": ["accessibility", "a11y", "wcag", "screen readers"],
  "microservices": ["microservices", "microservice", "distributed systems", "event-driven"],
  "kafka": ["kafka", "apache kafka", "event streaming", "rabbitmq", "message broker"],
  "redis": ["redis", "in-memory cache", "caching"],
};

const POWER_ACTION_VERBS = [
  "architected", "spearheaded", "engineered", "orchestrated", "optimized",
  "automated", "accelerated", "reduced", "designed", "shipped", "scaled",
  "led", "championed", "standardized", "overhauled", "implemented",
  "slashed", "elevated", "transformed", "fine-tuned", "deployed",
  "pioneered", "refactored", "ingested", "eliminated", "delivered",
];

const WEAK_PASSIVE_PHRASES = [
  "worked on", "responsible for", "assisted with", "handled",
  "helped", "participated in", "duties included", "tasked with",
  "contributed to", "involved in",
];

/**
 * Checks if a specific skill name or its synonyms appear in the resume text or parsed skills
 */
export function checkSkillInResume(
  skillName: string,
  userSkills: string[],
  rawText: string
): boolean {
  const normText = (rawText || "").toLowerCase();
  const normUserSkills = (userSkills || []).map((s) => s.toLowerCase().trim());
  const skillLower = skillName.toLowerCase();

  // 1. Direct contains check
  if (normText.includes(skillLower) || normUserSkills.includes(skillLower)) {
    return true;
  }

  // 2. Check synonyms dictionary
  for (const [key, aliases] of Object.entries(SYNONYMS_MAP)) {
    if (skillLower.includes(key) || key.includes(skillLower)) {
      if (aliases.some((alias) => normText.includes(alias) || normUserSkills.some((s) => s.includes(alias)))) {
        return true;
      }
    }
  }

  // 3. Sub-word token matching for compound skill names (e.g. "React / Next.js")
  const tokens = skillLower.split(/[/,&()+-]/).map((t) => t.trim()).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (normText.includes(token) || normUserSkills.some((s) => s.includes(token))) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates Quantifiable Metrics & Numbers in resume text
 */
export function extractMetrics(rawText: string): MetricFinding[] {
  const text = rawText || "";
  const findings: MetricFinding[] = [];

  // Percentage improvements (e.g. 45%, 99.9%, 2.5x)
  const pctRegex = /\b(\d+(?:\.\d+)?%)\b/g;
  let match;
  while ((match = pctRegex.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    findings.push({
      type: "percentage",
      snippet: text.substring(start, end).replace(/\s+/g, " ").trim(),
    });
    if (findings.length >= 8) break;
  }

  // Currency amounts (e.g. $4M, $150K, $1.2 million)
  const currencyRegex = /(\$[\d,.]+[kKmMbB]?|\b\d+[\s]*(?:million|thousand|billion)\s*dollars?)/gi;
  while ((match = currencyRegex.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    findings.push({
      type: "currency",
      snippet: text.substring(start, end).replace(/\s+/g, " ").trim(),
    });
    if (findings.length >= 12) break;
  }

  // User Scale & Throughput (e.g. 200k users, 10M requests, 500 QPS)
  const scaleRegex = /\b(\d+(?:\.\d+)?\s*(?:k|m|b|million|thousand)?\s*(?:users|dau|mau|requests|queries|qps|rps|req\/sec|customers|concurrent))\b/gi;
  while ((match = scaleRegex.exec(text)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(text.length, match.index + match[0].length + 30);
    findings.push({
      type: "scale",
      snippet: text.substring(start, end).replace(/\s+/g, " ").trim(),
    });
    if (findings.length >= 15) break;
  }

  return findings;
}

/**
 * Checks for ATS essential structure sections
 */
export function checkSections(rawText: string): SectionHealth[] {
  const lower = (rawText || "").toLowerCase();

  const sections: SectionHealth[] = [
    {
      name: "Contact Information",
      present: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rawText) &&
               /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(rawText),
      notes: "Email and phone number detected for candidate contactability.",
    },
    {
      name: "Professional Summary",
      present: /(summary|profile|about me|objective|overview)/i.test(lower),
      notes: "Opening elevator pitch outlining core strengths and career focus.",
    },
    {
      name: "Work Experience",
      present: /(experience|employment|work history|career history|professional background)/i.test(lower),
      notes: "Chronological job positions, company names, and bulleted achievements.",
    },
    {
      name: "Technical Skills",
      present: /(skills|technical proficiencies|technologies|competencies|tools)/i.test(lower),
      notes: "Dedicated skills inventory easily scanned by ATS parsers.",
    },
    {
      name: "Education & Credentials",
      present: /(education|degree|bachelor|master|ph\.d|university|college|certifications)/i.test(lower),
      notes: "Degrees, academic background, or verified industry certifications.",
    },
    {
      name: "Projects & Impact",
      present: /(projects|key achievements|open source|portfolio|publications)/i.test(lower),
      notes: "Demonstrates practical engineering execution beyond everyday duties.",
    },
  ];

  return sections;
}

/**
 * Comprehensive Multi-Factor ATS Diagnostic Calculation
 */
export function calculateAtsDiagnostics(
  rawText: string,
  userSkills: string[],
  role: MarketRole
): AtsDiagnostics {
  const text = rawText || "";
  const lowerText = text.toLowerCase();

  // 1. Skill Matching
  const skillsResults: SkillMatchResult[] = role.skills.map((s) => {
    const isMatched = checkSkillInResume(s.name, userSkills, text);
    return {
      name: s.name,
      category: s.category,
      importance: s.importance,
      match: isMatched,
      suggestedBullet: !isMatched
        ? `Architected and deployed enterprise solutions leveraging ${s.name}, improving operational throughput and system maintainability.`
        : undefined,
    };
  });

  const matchedSkillsCount = skillsResults.filter((s) => s.match).length;
  const totalSkillsCount = skillsResults.length;
  
  // Weighted Keyword Score (Critical skills count double, bonus skills count 0.5)
  let weightedPointsEarned = 0;
  let weightedPointsPossible = 0;

  skillsResults.forEach((s) => {
    const weight = s.importance === "critical" ? 3 : s.importance === "high" ? 2 : 1;
    weightedPointsPossible += weight;
    if (s.match) {
      weightedPointsEarned += weight;
    }
  });

  const keywordScore = Math.min(100, Math.round((weightedPointsEarned / (weightedPointsPossible || 1)) * 100));
  const criticalMissing = skillsResults
    .filter((s) => !s.match && (s.importance === "critical" || s.importance === "high"))
    .map((s) => s.name);

  // 2. Quantified Impact Score
  const metricsFound = extractMetrics(text);
  // Base 35 points if text exists, plus 12 points per distinct metric finding up to 100
  const impactScore = Math.min(100, Math.max(25, 35 + metricsFound.length * 12));

  // 3. Structural Health Score
  const sections = checkSections(text);
  const presentSectionsCount = sections.filter((s) => s.present).length;
  const structuralScore = Math.round((presentSectionsCount / sections.length) * 100);

  // 4. Action Verbs & Verbiage Score
  const strongVerbsFound: string[] = [];
  POWER_ACTION_VERBS.forEach((verb) => {
    if (new RegExp(`\\b${verb}\\b`, "i").test(lowerText)) {
      strongVerbsFound.push(verb.charAt(0).toUpperCase() + verb.slice(1));
    }
  });

  const weakPhrasesFound: string[] = [];
  WEAK_PASSIVE_PHRASES.forEach((phrase) => {
    if (lowerText.includes(phrase)) {
      weakPhrasesFound.push(phrase);
    }
  });

  let verbsScore = Math.min(100, 30 + strongVerbsFound.length * 10);
  // Deduct for passive weak phrases
  verbsScore = Math.max(20, verbsScore - weakPhrasesFound.length * 8);

  // 5. Machine Learning Predicted ATS Score
  const mlResult = predictMlAtsScore(text, userSkills, role);
  const overallScore = mlResult.atsScore;
  const ratingTier = mlResult.ratingTier;
  const ratingColor = mlResult.ratingColor;
  const summaryFeedback = mlResult.summaryFeedback;

  // 6. Actionable Recommendations
  const recommendations: AtsDiagnostics["recommendations"] = [];

  if (criticalMissing.length > 0) {
    recommendations.push({
      category: "Keyword",
      priority: "High",
      title: `Inject Core Market Keywords (${criticalMissing.slice(0, 3).join(", ")})`,
      description: `Current job postings heavily weigh ${criticalMissing.slice(0, 4).join(", ")}. Integrate these into your project bullets and technical skills section.`,
    });
  }

  if (metricsFound.length < 3) {
    recommendations.push({
      category: "Metrics",
      priority: "High",
      title: "Quantify Bullet Points with Google's XYZ Formula",
      description: "Recruiters look for concrete scale and impact. Frame achievements as: 'Accomplished [X] as measured by [Y] by doing [Z]' (e.g. reduced latency by 35% or supported 150K DAU).",
    });
  }

  const missingSections = sections.filter((s) => !s.present);
  if (missingSections.length > 0) {
    recommendations.push({
      category: "Structure",
      priority: "Medium",
      title: `Add Missing Sections: ${missingSections.map((s) => s.name).join(", ")}`,
      description: "Standard ATS parsers search for distinct header titles. Make sure each section has a clear, conventional heading.",
    });
  }

  if (weakPhrasesFound.length > 0) {
    recommendations.push({
      category: "Verbs",
      priority: "Medium",
      title: "Replace Passive Verbs with Dynamic Action Verbs",
      description: `Found passive phrasing (${weakPhrasesFound.slice(0, 2).map((w) => `"${w}"`).join(", ")}). Replace with power verbs like 'Architected', 'Spearheaded', 'Optimized', or 'Automated'.`,
    });
  }

  return {
    overallScore,
    ratingTier,
    ratingColor,
    summaryFeedback,
    pillarScores: {
      keywordMatch: keywordScore,
      quantifiedImpact: impactScore,
      structuralHealth: structuralScore,
      actionVerbs: verbsScore,
    },
    skills: skillsResults,
    matchedSkillsCount,
    totalSkillsCount,
    criticalMissing,
    metricsFound,
    sections,
    strongVerbsFound,
    weakPhrasesFound,
    recommendations,
  };
}
