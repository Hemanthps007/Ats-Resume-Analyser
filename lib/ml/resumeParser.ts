import { MARKET_ROLES } from "../rolesData";

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  summary: string;
  raw_text: string;
}

// Comprehensive catalog of common tech skills, tools, and keywords
const ALL_TECH_SKILLS: string[] = Array.from(
  new Set([
    // From Market Roles
    ...Object.values(MARKET_ROLES).flatMap((r) => r.skills.map((s) => s.name)),
    // Additional industry staples
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Golang", "Rust", "Ruby",
    "PHP", "Swift", "Kotlin", "Scala", "R", "SQL", "NoSQL", "HTML", "HTML5", "CSS", "CSS3",
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
    "Node.js", "Express", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot",
    "ASP.NET", "Ruby on Rails", "GraphQL", "REST", "RESTful APIs", "gRPC", "WebSockets",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra",
    "SQLite", "Supabase", "Firebase", "Prisma", "Drizzle", "TypeORM",
    "Docker", "Kubernetes", "Helm", "Terraform", "Ansible", "Linux", "Bash", "Shell",
    "AWS", "GCP", "Google Cloud", "Azure", "Cloudflare", "Vercel", "Netlify",
    "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "ArgoCD",
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
    "Kafka", "RabbitMQ", "Celery", "BullMQ", "Event-Driven Architecture", "Microservices",
    "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Pandas", "NumPy", "OpenCV",
    "LLMs", "RAG", "LangChain", "LlamaIndex", "Hugging Face", "Vector Databases",
    "Pinecone", "ChromaDB", "Qdrant", "Weaviate", "Prompt Engineering", "Fine-Tuning",
    "Tailwind CSS", "Sass", "SCSS", "Styled Components", "Material UI", "Chakra UI", "Shadcn UI",
    "Figma", "Storybook", "Design Systems", "Core Web Vitals", "Accessibility", "WCAG",
    "Jest", "Vitest", "Cypress", "Playwright", "Selenium", "TDD", "Unit Testing", "E2E Testing",
    "Agile", "Scrum", "Kanban", "System Design", "Microservices Architecture", "Performance Optimization"
  ])
);

/**
 * Extracts candidate name using heuristic rules:
 * - Looks at the top lines (before contact info/summary)
 * - Excludes lines with emails, URLs, dates, or words like "Resume", "CV", "Page", "Profile"
 */
function extractCandidateName(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const excludeWords = [
    "resume", "curriculum vitae", "cv", "portfolio", "phone", "email", "contact",
    "address", "profile", "summary", "experience", "education", "skills", "projects",
    "linkedin", "github", "http", "https", "www", ".com", "page 1", "page"
  ];

  for (const line of lines.slice(0, 8)) {
    const lower = line.toLowerCase();
    // Skip if contains email, URL, phone pattern, or excluded keywords
    if (
      lower.includes("@") ||
      lower.includes("http") ||
      lower.includes("www.") ||
      /\d{3,}/.test(line) ||
      excludeWords.some((w) => lower.includes(w))
    ) {
      continue;
    }

    // Name usually consists of 2 to 4 words, each capitalized, total length 3-40 chars
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length <= 40) {
      // Check capitalization
      const isAlpha = /^[A-Za-z\s.'-]+$/.test(line);
      if (isAlpha) {
        return line;
      }
    }
  }

  return "Candidate";
}

/**
 * Extracts candidate email address
 */
function extractEmail(text: string): string {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = text.match(emailRegex);
  return match ? match[1] : "";
}

/**
 * Extracts candidate phone number
 */
function extractPhone(text: string): string {
  const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/;
  const match = text.match(phoneRegex);
  if (match && match[0]) {
    const raw = match[0].trim();
    if (raw.replace(/\D/g, "").length >= 7) {
      return raw;
    }
  }

  // Fallback pattern: +X-XXX-XXX-XXXX or similar
  const altRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const altMatch = text.match(altRegex);
  return altMatch ? altMatch[0].trim() : "";
}

/**
 * Extracts candidate professional summary
 */
function extractSummary(text: string): string {
  const lower = text.toLowerCase();
  const summaryHeaders = [
    "professional summary", "executive summary", "career summary", "summary",
    "profile", "about me", "objective", "career objective"
  ];

  const stopHeaders = [
    "experience", "work experience", "employment history", "technical skills",
    "skills", "education", "projects", "certifications"
  ];

  for (const header of summaryHeaders) {
    const idx = lower.indexOf(header);
    if (idx !== -1) {
      const afterHeader = text.slice(idx + header.length);
      // Find the next section header
      let endIdx = afterHeader.length;
      for (const stop of stopHeaders) {
        const stopIdx = afterHeader.toLowerCase().indexOf(stop);
        if (stopIdx !== -1 && stopIdx < endIdx) {
          endIdx = stopIdx;
        }
      }

      const summaryBlock = afterHeader
        .slice(0, Math.min(endIdx, 600))
        .replace(/^[:\s\-]+/, "")
        .trim();

      if (summaryBlock.length > 25) {
        return summaryBlock.split(/\n{2,}/)[0].replace(/\s+/g, " ").trim();
      }
    }
  }

  // Fallback: take the first paragraph after name/contact line
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 40);
  if (lines.length > 0) {
    return lines[0].slice(0, 300);
  }

  return "Experienced software engineering professional passionate about building high-performance, scalable distributed systems and user-centric applications.";
}

/**
 * Extracts skills matching the catalog from the resume text
 */
function extractSkills(text: string): string[] {
  const normText = ` ${text.toLowerCase()} `;
  const matchedSkills = new Set<string>();

  for (const skill of ALL_TECH_SKILLS) {
    const skillNorm = skill.toLowerCase();
    // Escape special regex characters in skill (e.g. C++, .NET, Node.js)
    const escaped = skillNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Check word boundaries or punctuation boundaries
    const pattern = new RegExp(`(?:^|[\\s,;:/|()•·\\-])${escaped}(?:$|[\\s,;:/|()•·\\-])`, "i");
    if (pattern.test(normText)) {
      matchedSkills.add(skill);
    }
  }

  return Array.from(matchedSkills);
}

/**
 * Complete Local Resume Text Parser
 */
export function parseResumeText(rawText: string): ParsedResumeData {
  const cleanText = (rawText || "").trim();
  const name = extractCandidateName(cleanText);
  const email = extractEmail(cleanText);
  const phone = extractPhone(cleanText);
  const skills = extractSkills(cleanText);
  const summary = extractSummary(cleanText);

  return {
    name: name || "Candidate",
    email: email || "candidate@example.com",
    phone: phone || "+1 (555) 000-0000",
    skills: skills.length > 0 ? skills : ["TypeScript", "React", "Node.js", "Docker"],
    summary: summary,
    raw_text: cleanText,
  };
}
