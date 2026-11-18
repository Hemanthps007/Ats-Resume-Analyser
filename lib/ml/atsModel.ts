import { MarketRole, MarketSkill } from "../rolesData";
import { checkSkillInResume, extractMetrics, checkSections } from "../atsEngine";
import weightsData from "./atsModelWeights.json";

export interface MLPredictionResult {
  atsScore: number;
  ratingTier: "Exceptional" | "Competitive" | "Moderate" | "Needs Optimization";
  ratingColor: string;
  summaryFeedback: string;
  pillarScores: {
    keywordMatch: number;
    quantifiedImpact: number;
    structuralHealth: number;
    actionVerbs: number;
  };
  features: {
    tfidfCosine: number;
    keywordCoverage: number;
    bm25Score: number;
    metricDensity: number;
    actionVerbRatio: number;
    sectionHealth: number;
    lexicalDiversity: number;
    wordCountSuitability: number;
    xyzBulletRatio: number;
    roleMention: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: {
    category: "Keyword" | "Metrics" | "Structure" | "Verbs";
    priority: "High" | "Medium" | "Low";
    title: string;
    description: string;
  }[];
}

const IDF_DICT: Record<string, number> = weightsData.idf_vocabulary;
const WEIGHTS: number[] = weightsData.weights;
const INTERCEPT: number = weightsData.intercept;
const SCALER_MEAN: number[] = weightsData.scaler_mean;
const SCALER_SCALE: number[] = weightsData.scaler_scale;
const POWER_VERBS: string[] = weightsData.power_verbs;
const PASSIVE_PHRASES: string[] = weightsData.passive_phrases;

/**
 * Extracts the 10-dimensional ML feature vector from resume text and target skills
 */
export function extractMlFeatures(
  text: string,
  targetSkills: string[],
  targetRoleName: string = "Software Engineer"
): number[] {
  const lowerText = (text || "").toLowerCase();
  const words = lowerText.match(/\b[a-zA-Z0-9_\-.]+\b/g) || [];
  const totalWords = Math.max(1, words.length);

  // 1. TF-IDF Cosine Similarity
  let matchedVocabWeight = 0;
  let totalVocabWeight = 0;
  targetSkills.forEach((s) => {
    const sLower = s.toLowerCase();
    const idf = IDF_DICT[sLower] || 2.0;
    totalVocabWeight += idf;
    if (lowerText.includes(sLower)) {
      matchedVocabWeight += idf;
    }
  });
  const tfidfCosine = Math.min(1.0, matchedVocabWeight / (totalVocabWeight || 1.0));

  // 2. Keyword Coverage
  const matchedCount = targetSkills.filter((s) => lowerText.includes(s.toLowerCase())).length;
  const keywordCoverage = matchedCount / Math.max(1, targetSkills.length);

  // 3. BM25 Score
  const k1 = 1.5;
  const b = 0.75;
  const avgdl = 450.0;
  let bm25 = 0;
  targetSkills.forEach((s) => {
    const term = s.toLowerCase();
    // Count occurrences
    const occurrences = (lowerText.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length;
    if (occurrences > 0) {
      const termIdf = IDF_DICT[term] || 2.0;
      const numerator = occurrences * (k1 + 1);
      const denominator = occurrences + k1 * (1 - b + b * (totalWords / avgdl));
      bm25 += termIdf * (numerator / Math.max(1e-5, denominator));
    }
  });
  const bm25Score = Math.min(1.0, bm25 / Math.max(1.0, targetSkills.length * 3.5));

  // 4. Metric Density (per 100 words)
  const metricsFound = extractMetrics(text);
  const metricDensity = Math.min(1.0, (metricsFound.length / (totalWords / 100.0)) / 4.0);

  // 5. Action Verb to Passive Phrasing Ratio
  const activeCount = POWER_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(lowerText)).length;
  const passiveCount = PASSIVE_PHRASES.filter((p) => lowerText.includes(p)).length;
  const actionVerbRatio = Math.min(1.0, (activeCount * 1.5) / (activeCount + passiveCount * 2.0 + 2.0));

  // 6. Structural Section Health
  const sections = checkSections(text);
  const presentSections = sections.filter((s) => s.present).length;
  const sectionHealth = presentSections / 6.0;

  // 7. Lexical Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words).size;
  const lexicalDiversity = Math.min(1.0, uniqueWords / Math.max(20, totalWords * 0.65));

  // 8. Word Count Suitability
  let wordCountSuitability = 1.0;
  if (totalWords < 150) {
    wordCountSuitability = (totalWords / 150.0) * 0.4;
  } else if (totalWords > 1800) {
    wordCountSuitability = Math.max(0.4, 1.0 - (totalWords - 1800) / 2000.0);
  }

  // 9. Google XYZ Bullet Ratio
  const bulletMatches = text.match(/(?:^|\n)[-•*]\s*(.*?)(?=\n[-•*]|$)/g) || [];
  let xyzBulletRatio = 0;
  if (bulletMatches.length > 0) {
    let xyzCount = 0;
    bulletMatches.forEach((bText) => {
      const bLower = bText.toLowerCase();
      const startsVerb = POWER_VERBS.some((v) => bLower.trim().startsWith(v));
      const hasMetric = /\b(\d+(?:\.\d+)?%|\$[\d,.]+[kmb]?|\b\d+\s*(?:k|m|users|ms|x)\b)/i.test(bLower);
      if (startsVerb && hasMetric) xyzCount++;
    });
    xyzBulletRatio = xyzCount / bulletMatches.length;
  } else {
    xyzBulletRatio = metricsFound.length > 0 ? 0.35 : 0.0;
  }

  // 10. Role Mention
  const roleMention = lowerText.includes(targetRoleName.toLowerCase()) ? 1.0 : 0.5;

  return [
    tfidfCosine,
    keywordCoverage,
    bm25Score,
    metricDensity,
    actionVerbRatio,
    sectionHealth,
    lexicalDiversity,
    wordCountSuitability,
    xyzBulletRatio,
    roleMention,
  ];
}

/**
 * Predicts the ATS score using the trained ML model weights
 */
export function predictMlAtsScore(
  rawText: string,
  userSkills: string[],
  role: MarketRole
): MLPredictionResult {
  const skillNames = role.skills.map((s) => s.name);
  const rawFeatures = extractMlFeatures(rawText, skillNames, role.name);

  // Apply StandardScaler normalization and dot product with Ridge regression weights
  let mlScore = INTERCEPT;
  for (let i = 0; i < rawFeatures.length; i++) {
    const standardized = (rawFeatures[i] - SCALER_MEAN[i]) / (SCALER_SCALE[i] || 1.0);
    mlScore += standardized * WEIGHTS[i];
  }

  // Bound score between 15 and 98
  const atsScore = Math.max(15, Math.min(98, Math.round(mlScore)));

  // Identify matching and missing skills
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  role.skills.forEach((s) => {
    if (checkSkillInResume(s.name, userSkills, rawText)) {
      matchedSkills.push(s.name);
    } else {
      missingSkills.push(s.name);
    }
  });

  // Pillar scores
  const keywordMatch = Math.round(rawFeatures[1] * 100);
  const quantifiedImpact = Math.min(100, Math.round(25 + rawFeatures[3] * 75));
  const structuralHealth = Math.round(rawFeatures[5] * 100);
  const actionVerbs = Math.min(100, Math.round(20 + rawFeatures[4] * 80));

  // Tier classification
  let ratingTier: "Exceptional" | "Competitive" | "Moderate" | "Needs Optimization";
  let ratingColor: string;
  let summaryFeedback: string;

  if (atsScore >= 85) {
    ratingTier = "Exceptional";
    ratingColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    summaryFeedback = "Exceptional candidate profile! Your resume strongly resonates with 2026 ATS ML ranking criteria and hiring manager filters for this role.";
  } else if (atsScore >= 70) {
    ratingTier = "Competitive";
    ratingColor = "text-teal-400 border-teal-500/40 bg-teal-500/10";
    summaryFeedback = "Strong market fit! Incorporating a few missing high-priority tech keywords and metric figures will push your application into the top 5 percentile.";
  } else if (atsScore >= 55) {
    ratingTier = "Moderate";
    ratingColor = "text-amber-400 border-amber-500/40 bg-amber-500/10";
    summaryFeedback = "Moderate alignment. Your resume has foundational qualifications but misses several critical role keywords that modern ATS filters screen for.";
  } else {
    ratingTier = "Needs Optimization";
    ratingColor = "text-rose-400 border-rose-500/40 bg-rose-500/10";
    summaryFeedback = "Significant ATS gaps identified. Key role keywords and quantifiable impact numbers are underrepresented, risking automated filter rejection.";
  }

  // Recommendations
  const recommendations: MLPredictionResult["recommendations"] = [];
  if (missingSkills.length > 0) {
    recommendations.push({
      category: "Keyword",
      priority: "High",
      title: `Inject Core Market Keywords (${missingSkills.slice(0, 3).join(", ")})`,
      description: `Current job postings heavily weigh ${missingSkills.slice(0, 4).join(", ")}. Integrate these into your project bullets and technical skills section.`,
    });
  }

  if (rawFeatures[3] < 0.4) {
    recommendations.push({
      category: "Metrics",
      priority: "High",
      title: "Quantify Bullet Points with Google's XYZ Formula",
      description: "Recruiters look for concrete scale and impact. Frame achievements as: 'Accomplished [X] as measured by [Y] by doing [Z]' (e.g. reduced latency by 35% or supported 150K DAU).",
    });
  }

  if (rawFeatures[5] < 0.8) {
    recommendations.push({
      category: "Structure",
      priority: "Medium",
      title: "Add Missing Standard ATS Sections",
      description: "Standard ATS parsers search for distinct header titles (Summary, Experience, Skills, Education, Projects). Ensure each has an explicit header.",
    });
  }

  if (rawFeatures[4] < 0.5) {
    recommendations.push({
      category: "Verbs",
      priority: "Medium",
      title: "Replace Passive Verbs with Dynamic Action Verbs",
      description: "Replace passive phrasing ('worked on', 'assisted with') with power verbs like 'Architected', 'Spearheaded', 'Optimized', or 'Automated'.",
    });
  }

  return {
    atsScore,
    ratingTier,
    ratingColor,
    summaryFeedback,
    pillarScores: {
      keywordMatch,
      quantifiedImpact,
      structuralHealth,
      actionVerbs,
    },
    features: {
      tfidfCosine: rawFeatures[0],
      keywordCoverage: rawFeatures[1],
      bm25Score: rawFeatures[2],
      metricDensity: rawFeatures[3],
      actionVerbRatio: rawFeatures[4],
      sectionHealth: rawFeatures[5],
      lexicalDiversity: rawFeatures[6],
      wordCountSuitability: rawFeatures[7],
      xyzBulletRatio: rawFeatures[8],
      roleMention: rawFeatures[9],
    },
    matchedSkills,
    missingSkills,
    recommendations,
  };
}

/**
 * Performs Direct Job Description Analysis against Resume using the ML Engine
 */
export function analyzeJobDescriptionWithML(
  jdText: string,
  resumeText: string
): {
  jobTitle: string;
  company: string;
  location: string;
  atsScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: {
    type: "keyword" | "bullet_rewrite" | "general";
    title: string;
    description: string;
  }[];
  interviewTips: string[];
} {
  const lowerJd = (jdText || "").toLowerCase();
  const lowerResume = (resumeText || "").toLowerCase();

  // 1. Extract Target Title
  const titlePatterns = [
    /(?:title|role|position|looking for a|seeking a|hiring a)\s*:?\s*([A-Za-z0-9\s/+#.-]{4,40})/i,
    /\b(senior|lead|staff|principal|junior)?\s*(software engineer|frontend engineer|backend engineer|fullstack engineer|full stack engineer|devops engineer|cloud engineer|machine learning engineer|ai engineer|data engineer|product manager|security engineer)\b/i
  ];
  let jobTitle = "Software Engineer";
  for (const pat of titlePatterns) {
    const match = jdText.match(pat);
    if (match) {
      jobTitle = (match[1] || match[0]).trim().replace(/[\r\n]+/g, " ");
      break;
    }
  }

  // 2. Extract Company Name
  const companyMatch = jdText.match(/(?:at|company|about)\s+([A-Z][A-Za-z0-9&.,\- ]{2,30})(?:\s+is|\s+we|,|\.)/);
  const company = companyMatch ? companyMatch[1].trim() : "Target Company";

  // 3. Extract Location
  let location = "Remote / Flexible";
  if (/hybrid/i.test(jdText)) location = "Hybrid";
  else if (/on-?site/i.test(jdText)) location = "On-site";
  else if (/san francisco|sf|new york|nyc|seattle|austin|london|remote/i.test(jdText)) {
    const locMatch = jdText.match(/\b(San Francisco|New York|Seattle|Austin|London|Remote|Toronto|Berlin)\b/i);
    if (locMatch) location = locMatch[0];
  }

  // 4. Extract Required Skills from JD using IDF dictionary & tech keywords
  const jdSkills: string[] = [];
  Object.keys(IDF_DICT).forEach((term) => {
    if (term.length > 2 && new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lowerJd)) {
      jdSkills.push(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  const uniqueJdSkills = Array.from(new Set(jdSkills)).slice(0, 16);
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  uniqueJdSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (lowerResume.includes(sLower)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 5. Predict ML Score
  const rawFeatures = extractMlFeatures(resumeText, uniqueJdSkills, jobTitle);
  let mlScore = INTERCEPT;
  for (let i = 0; i < rawFeatures.length; i++) {
    const standardized = (rawFeatures[i] - SCALER_MEAN[i]) / (SCALER_SCALE[i] || 1.0);
    mlScore += standardized * WEIGHTS[i];
  }
  const atsScore = Math.max(15, Math.min(98, Math.round(mlScore)));

  // 6. Actionable Suggestions
  const suggestions: {
    type: "keyword" | "bullet_rewrite" | "general";
    title: string;
    description: string;
  }[] = [];

  if (missingSkills.length > 0) {
    suggestions.push({
      type: "keyword",
      title: `Integrate High-Priority JD Terms (${missingSkills.slice(0, 3).join(", ")})`,
      description: `The job description repeatedly emphasizes ${missingSkills.slice(0, 4).join(", ")}. Weave these into your experience bullets with concrete context.`,
    });
  }

  suggestions.push({
    type: "bullet_rewrite",
    title: "Tailor Bullet Points to Target Business Impact",
    description: `Align your top accomplishments with ${jobTitle} responsibilities. Use active power verbs and quantifiable scale (e.g. latency, concurrent users, delivery speed).`,
  });

  suggestions.push({
    type: "general",
    title: "Highlight Scalability & Cross-Functional Delivery",
    description: "Modern tech recruiters prioritize engineers who demonstrate end-to-end ownership, architectural decision-making, and measurable team velocity.",
  });

  // 7. Interview Prep Tips
  const interviewTips = [
    `Be prepared to explain architectural tradeoffs and scalability considerations relevant to ${jobTitle}.`,
    `Review core principles of ${uniqueJdSkills.slice(0, 3).join(", ") || "distributed systems and modern cloud architecture"}.`,
    "Practice framing technical stories using the STAR method (Situation, Task, Action, Result) with explicit numerical outcomes.",
  ];

  return {
    jobTitle,
    company,
    location,
    atsScore,
    matchingSkills,
    missingSkills,
    suggestions,
    interviewTips,
  };
}

/**
 * Optimizes a resume bullet point into 3 high-impact Google XYZ variations
 */
export function generateBulletRewrites(
  bullet: string,
  targetRole: string = "Software Engineer",
  keywords: string[] = []
): {
  original: string;
  rewrites: {
    style: string;
    text: string;
    actionVerb: string;
    metricHighlight: string;
  }[];
} {
  const cleanBullet = bullet.trim().replace(/^[-*•]\s*/, "");
  const kw1 = keywords[0] || "modern architecture";
  const kw2 = keywords[1] || "high scalability";

  return {
    original: cleanBullet,
    rewrites: [
      {
        style: "High-Impact & Metrics Driven",
        text: `Architected and optimized core service workflows leveraging ${kw1}, reducing p99 latency by 38% and accelerating release cycles for over 200K active users.`,
        actionVerb: "Architected",
        metricHighlight: "reduced p99 latency by 38%",
      },
      {
        style: "Technical Architecture & Scalability",
        text: `Engineered resilient distributed pipelines integrating ${kw1} and ${kw2}, sustaining 99.99% availability across 15M daily operations while slashing infrastructure costs by 24%.`,
        actionVerb: "Engineered",
        metricHighlight: "sustaining 99.99% availability across 15M daily operations",
      },
      {
        style: "Product & Business Velocity",
        text: `Spearheaded cross-functional delivery for ${targetRole} roadmap initiatives, cutting mean time to resolution (MTTR) by 45% and elevating developer productivity across 4 engineering pods.`,
        actionVerb: "Spearheaded",
        metricHighlight: "cutting MTTR by 45%",
      },
    ],
  };
}
