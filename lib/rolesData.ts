export interface MarketSkill {
  name: string;
  category: "core" | "cloud_data" | "tools_arch" | "soft_skills";
  importance: "critical" | "high" | "bonus";
  description?: string;
}

export interface MarketRole {
  id: string;
  name: string;
  category: "Engineering" | "AI & Data" | "Cloud & DevOps" | "Product & Design";
  description: string;
  benchmarkScore: number;
  marketDemand: "Explosive" | "High" | "Steady";
  averageSalary: string;
  skills: MarketSkill[];
  keyActionVerbs: string[];
  interviewFocus: string[];
  seniorityLevels: {
    level: "Junior" | "Mid-Level" | "Senior" | "Lead / Staff";
    expectedYears: string;
    mustHaveKeywords: string[];
  }[];
}

export const MARKET_ROLES: Record<string, MarketRole> = {
  "frontend-engineer": {
    id: "frontend-engineer",
    name: "Frontend Engineer",
    category: "Engineering",
    description: "Builds modern, accessible, and high-performance user interfaces with React, Next.js, and TypeScript.",
    benchmarkScore: 82,
    marketDemand: "High",
    averageSalary: "$125,000 - $165,000",
    skills: [
      { name: "React 18 / 19", category: "core", importance: "critical" },
      { name: "Next.js (App Router)", category: "core", importance: "critical" },
      { name: "TypeScript", category: "core", importance: "critical" },
      { name: "Tailwind CSS", category: "core", importance: "high" },
      { name: "State Management (Zustand / Redux / TanStack Query)", category: "core", importance: "high" },
      { name: "Core Web Vitals & Performance Optimization", category: "tools_arch", importance: "high" },
      { name: "Web Accessibility (WCAG 2.1 AA / a11y)", category: "tools_arch", importance: "high" },
      { name: "Component Testing (Vitest / React Testing Library)", category: "tools_arch", importance: "high" },
      { name: "End-to-End Testing (Playwright / Cypress)", category: "tools_arch", importance: "high" },
      { name: "Modern Build Tooling (Vite / Turbopack / Webpack)", category: "tools_arch", importance: "bonus" },
      { name: "REST & GraphQL Client Architecture", category: "cloud_data", importance: "high" },
      { name: "Design Systems & Figma Integration", category: "soft_skills", importance: "high" },
      { name: "CI/CD & Cloud Deployment (Vercel / AWS Amplify)", category: "cloud_data", importance: "bonus" },
      { name: "Cross-Functional Collaboration & Code Reviews", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Architected", "Engineered", "Optimized", "Spearheaded", "Refactored", "Accelerated", "Delivered"],
    interviewFocus: [
      "React Concurrent rendering & Server Components",
      "Core Web Vitals (LCP, FID/INP, CLS) debugging",
      "State synchronization & cache invalidation patterns",
      "Scalable CSS architecture and design tokens",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["React", "JavaScript", "HTML5", "CSS3", "Git"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["TypeScript", "Next.js", "Tailwind", "State Management", "Testing"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Web Vitals", "Architecture", "Design Systems", "Mentorship", "CI/CD"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Technical Roadmap", "Cross-Platform Strategy", "Performance Governance", "Organizational Standards"] },
    ],
  },

  "backend-engineer": {
    id: "backend-engineer",
    name: "Backend Engineer",
    category: "Engineering",
    description: "Designs robust, scalable distributed services, high-throughput APIs, and data persistence layers.",
    benchmarkScore: 80,
    marketDemand: "Explosive",
    averageSalary: "$135,000 - $180,000",
    skills: [
      { name: "Node.js / Go / Python / Java", category: "core", importance: "critical" },
      { name: "Microservices & Distributed Systems", category: "tools_arch", importance: "critical" },
      { name: "PostgreSQL / MySQL / Relational DBs", category: "cloud_data", importance: "critical" },
      { name: "Redis Caching & In-Memory Stores", category: "cloud_data", importance: "high" },
      { name: "Message Brokers (Kafka / RabbitMQ / AWS SQS)", category: "cloud_data", importance: "high" },
      { name: "RESTful & gRPC API Design", category: "tools_arch", importance: "high" },
      { name: "Docker Containerization", category: "cloud_data", importance: "high" },
      { name: "Database Indexing & Query Optimization", category: "cloud_data", importance: "high" },
      { name: "Authentication & Authorization (OAuth2 / JWT / RBAC)", category: "tools_arch", importance: "high" },
      { name: "Cloud Services (AWS / GCP / Azure)", category: "cloud_data", importance: "high" },
      { name: "Unit & Integration Testing (Jest / PyTest / Go Test)", category: "tools_arch", importance: "high" },
      { name: "Observability (Prometheus / Grafana / Datadog)", category: "tools_arch", importance: "bonus" },
      { name: "High Concurrency & Load Balancing", category: "tools_arch", importance: "bonus" },
      { name: "System Design & Technical Documentation", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Engineered", "Scaled", "Architected", "Reduced latency", "Automated", "Streamlined", "Hardened"],
    interviewFocus: [
      "Database sharding, connection pooling, and ACID transactions",
      "Event-driven architecture and idempotency",
      "Rate limiting, circuit breakers, and fault tolerance",
      "Zero-downtime database migrations",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Node.js or Python", "SQL", "Git", "REST APIs"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Docker", "PostgreSQL", "Redis", "Microservices", "Unit Testing"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Distributed Systems", "Kafka", "High Availability", "Query Optimization", "AWS"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Multi-Region Architecture", "Fault Tolerance", "Capacity Planning", "Staff Mentorship"] },
    ],
  },

  "fullstack-developer": {
    id: "fullstack-developer",
    name: "Fullstack Developer",
    category: "Engineering",
    description: "Versatile engineer capable of building end-to-end web apps from UI components to relational databases.",
    benchmarkScore: 78,
    marketDemand: "Explosive",
    averageSalary: "$130,000 - $175,000",
    skills: [
      { name: "TypeScript & JavaScript", category: "core", importance: "critical" },
      { name: "React / Next.js", category: "core", importance: "critical" },
      { name: "Node.js / Express / NestJS", category: "core", importance: "critical" },
      { name: "PostgreSQL / Prisma / Supabase", category: "cloud_data", importance: "high" },
      { name: "Tailwind CSS & Responsive UI", category: "core", importance: "high" },
      { name: "API Integration & REST / GraphQL", category: "tools_arch", importance: "high" },
      { name: "Auth & Session Management", category: "tools_arch", importance: "high" },
      { name: "Docker & Container Workflows", category: "cloud_data", importance: "high" },
      { name: "CI/CD & GitHub Actions", category: "tools_arch", importance: "high" },
      { name: "Cloud Deployment (AWS / Vercel / Render)", category: "cloud_data", importance: "high" },
      { name: "Testing (Jest / Playwright)", category: "tools_arch", importance: "bonus" },
      { name: "NoSQL DBs (MongoDB / Redis)", category: "cloud_data", importance: "bonus" },
      { name: "Agile / Scrum Sprint Delivery", category: "soft_skills", importance: "high" },
      { name: "Full Lifecycle Product Execution", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Developed", "Delivered", "Architected", "Launched", "Integrated", "Accelerated", "Deployed"],
    interviewFocus: [
      "End-to-end data flow and type safety from DB to client",
      "SSR vs SSG vs Client rendering trade-offs",
      "ORM schema design and relational integrity",
      "Fullstack security (XSS, CSRF, SQLi prevention)",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["React", "Node.js", "SQL", "Git", "CSS"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Docker"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Full Lifecycle Architecture", "CI/CD", "AWS", "Performance Tuning"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["System Ownership", "Engineering Standards", "Technical Roadmaps"] },
    ],
  },

  "ai-ml-engineer": {
    id: "ai-ml-engineer",
    name: "AI & Machine Learning Engineer",
    category: "AI & Data",
    description: "Specializes in generative AI, LLM architectures, RAG systems, model fine-tuning, and production ML pipelines.",
    benchmarkScore: 85,
    marketDemand: "Explosive",
    averageSalary: "$150,000 - $210,000",
    skills: [
      { name: "Python (Advanced)", category: "core", importance: "critical" },
      { name: "PyTorch / TensorFlow", category: "core", importance: "critical" },
      { name: "Large Language Models (LLMs) & Prompting", category: "core", importance: "critical" },
      { name: "Retrieval-Augmented Generation (RAG)", category: "tools_arch", importance: "critical" },
      { name: "Vector Databases (Pinecone / Chroma / Qdrant / pgvector)", category: "cloud_data", importance: "critical" },
      { name: "LangChain / LlamaIndex / Agent Frameworks", category: "tools_arch", importance: "high" },
      { name: "Hugging Face Transformers & Datasets", category: "core", importance: "high" },
      { name: "Model Fine-Tuning (LoRA / PEFT / QLoRA)", category: "tools_arch", importance: "high" },
      { name: "Model Serving (vLLM / Triton / Ollama / FastAPI)", category: "cloud_data", importance: "high" },
      { name: "MLOps & Pipeline Orchestration (MLflow / Kubeflow)", category: "cloud_data", importance: "high" },
      { name: "Evaluation & Benchmarks (RAGAS / BLEU / ROUGE)", category: "tools_arch", importance: "high" },
      { name: "Docker & GPU Compute Management (CUDA / AWS SageMaker)", category: "cloud_data", importance: "bonus" },
      { name: "Data Processing (Pandas / NumPy / Polars)", category: "core", importance: "high" },
      { name: "AI Ethics, Guardrails & Hallucination Mitigation", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Trained", "Fine-tuned", "Deployed", "Architected", "Reduced hallucinations", "Optimized inference", "Evaluated"],
    interviewFocus: [
      "RAG embedding chunking strategies, hybrid search, and re-ranking",
      "Quantization techniques (AWQ, GPTQ, GGUF) and memory footprints",
      "Context window optimization and agentic reasoning loops",
      "End-to-end MLOps and automated continuous evaluation",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Python", "PyTorch", "Pandas", "Scikit-Learn", "Git"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["LLMs", "RAG", "Vector DBs", "LangChain", "FastAPI"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Fine-tuning", "vLLM", "MLOps", "Evaluation", "GPU Optimization"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Enterprise AI Architecture", "Research-to-Production", "Cost Governance"] },
    ],
  },

  "data-scientist": {
    id: "data-scientist",
    name: "Data Scientist",
    category: "AI & Data",
    description: "Derives actionable business intelligence and predictive power using statistical modeling, ML, and experiments.",
    benchmarkScore: 76,
    marketDemand: "High",
    averageSalary: "$130,000 - $175,000",
    skills: [
      { name: "Python / R", category: "core", importance: "critical" },
      { name: "SQL (Advanced Queries & Window Functions)", category: "cloud_data", importance: "critical" },
      { name: "Pandas & NumPy Data Wrangling", category: "core", importance: "critical" },
      { name: "Statistical Modeling & Hypothesis Testing", category: "core", importance: "critical" },
      { name: "Machine Learning (Scikit-Learn / XGBoost / LightGBM)", category: "core", importance: "critical" },
      { name: "A/B Testing & Experimentation Frameworks", category: "tools_arch", importance: "high" },
      { name: "Feature Engineering & Selection", category: "tools_arch", importance: "high" },
      { name: "Data Visualization (Tableau / PowerBI / Matplotlib / Seaborn)", category: "tools_arch", importance: "high" },
      { name: "Cloud Data Warehouses (BigQuery / Snowflake)", category: "cloud_data", importance: "high" },
      { name: "Jupyter Notebooks & Reproducibility", category: "tools_arch", importance: "high" },
      { name: "Time Series Analysis & Forecasting", category: "tools_arch", importance: "bonus" },
      { name: "Deep Learning (PyTorch / Keras)", category: "core", importance: "bonus" },
      { name: "Executive Stakeholder Storytelling", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Modeled", "Discovered", "Predicted", "Quantified", "Analyzed", "Optimized conversion", "Presented"],
    interviewFocus: [
      "Bias-variance trade-off and regularization",
      "Designing rigorous A/B tests with statistical power analysis",
      "Handling imbalanced datasets (SMOTE, precision-recall AUC)",
      "Translating raw business metrics into analytical models",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Python", "SQL", "Pandas", "Statistics", "Data Cleaning"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Scikit-Learn", "XGBoost", "A/B Testing", "Tableau/PowerBI", "Snowflake"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Predictive Pipelines", "Causal Inference", "Executive Communication", "Feature Store"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Enterprise Analytics Strategy", "Mentorship", "Revenue Impact Modeling"] },
    ],
  },

  "data-engineer": {
    id: "data-engineer",
    name: "Data Engineer",
    category: "AI & Data",
    description: "Constructs and maintains scalable data pipelines, data warehouses, and streaming infrastructure.",
    benchmarkScore: 81,
    marketDemand: "Explosive",
    averageSalary: "$135,000 - $185,000",
    skills: [
      { name: "SQL (Complex Analytical & Performance Tuning)", category: "core", importance: "critical" },
      { name: "Python / Scala", category: "core", importance: "critical" },
      { name: "Apache Spark / PySpark", category: "tools_arch", importance: "critical" },
      { name: "Cloud Data Warehouses (Snowflake / BigQuery / Databricks)", category: "cloud_data", importance: "critical" },
      { name: "Workflow Orchestration (Apache Airflow / Prefect / Dagster)", category: "tools_arch", importance: "high" },
      { name: "dbt (Data Build Tool) Modeling", category: "tools_arch", importance: "high" },
      { name: "Real-time Streaming (Apache Kafka / Flink / Spark Streaming)", category: "cloud_data", importance: "high" },
      { name: "Data Lakehouse Architecture (Delta Lake / Iceberg)", category: "cloud_data", importance: "high" },
      { name: "ETL / ELT Pipeline Architecture", category: "tools_arch", importance: "high" },
      { name: "Docker & Kubernetes", category: "cloud_data", importance: "bonus" },
      { name: "Data Quality & Governance (Great Expectations / Monte Carlo)", category: "tools_arch", importance: "high" },
      { name: "CI/CD for Data Pipelines", category: "tools_arch", importance: "bonus" },
      { name: "Cross-Functional Data Team Alignment", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Ingested", "Constructed", "Optimized pipelines", "Automated", "Transformed", "Reduced latency", "Architected"],
    interviewFocus: [
      "Spark partition skew, shuffle operations, and memory tuning",
      "Medallion architecture (Bronze, Silver, Gold data tiers)",
      "Idempotent data transformations and backfilling strategies",
      "SLA management for multi-terabyte data warehouses",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["SQL", "Python", "ETL basics", "Git"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Spark", "Airflow", "Snowflake or BigQuery", "dbt", "Data Modeling"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Kafka", "Lakehouse", "Streaming", "Performance Tuning", "Data Governance"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Enterprise Data Strategy", "Platform Reliability", "Cost Optimization"] },
    ],
  },

  "devops-cloud-engineer": {
    id: "devops-cloud-engineer",
    name: "DevOps & Cloud Platform Engineer",
    category: "Cloud & DevOps",
    description: "Automates infrastructure, continuous integration, container orchestration, and cloud reliability.",
    benchmarkScore: 84,
    marketDemand: "Explosive",
    averageSalary: "$140,000 - $190,000",
    skills: [
      { name: "Amazon Web Services (AWS) or GCP / Azure", category: "cloud_data", importance: "critical" },
      { name: "Infrastructure as Code (Terraform / OpenTofu)", category: "tools_arch", importance: "critical" },
      { name: "Kubernetes (K8s) & Container Orchestration", category: "cloud_data", importance: "critical" },
      { name: "Docker & Container Security", category: "cloud_data", importance: "critical" },
      { name: "CI/CD Pipelines (GitHub Actions / GitLab CI / ArgoCD)", category: "tools_arch", importance: "critical" },
      { name: "Linux Administration & Bash / Python Scripting", category: "core", importance: "high" },
      { name: "Helm Charts & Package Management", category: "tools_arch", importance: "high" },
      { name: "Monitoring & Observability (Prometheus / Grafana / Datadog)", category: "tools_arch", importance: "high" },
      { name: "Networking (VPC, Subnets, DNS, Load Balancers, TLS)", category: "cloud_data", importance: "high" },
      { name: "Security & Secrets Management (HashiCorp Vault / IAM)", category: "tools_arch", importance: "high" },
      { name: "Cloud Cost Optimization (FinOps)", category: "tools_arch", importance: "bonus" },
      { name: "GitOps Workflows & Zero-Downtime Deployments", category: "tools_arch", importance: "high" },
      { name: "Incident Response & On-Call Rotation", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Automated", "Provisioned", "Containerized", "Migrated", "Hardened", "Reduced downtime", "Streamlined"],
    interviewFocus: [
      "Kubernetes ingress controllers, CNI, and cluster auto-scaling",
      "Terraform state locking, drift detection, and modular design",
      "GitOps with ArgoCD and progressive canary rollouts",
      "Zero-trust cloud network security policies and IAM least privilege",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Linux", "Bash", "Docker", "Git", "Basic AWS"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Terraform", "Kubernetes", "CI/CD", "AWS or GCP", "Prometheus"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["ArgoCD", "Multi-Cluster K8s", "FinOps", "Disaster Recovery", "Zero-Trust"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Platform Engineering", "Developer Productivity", "Global Infrastructure"] },
    ],
  },

  "site-reliability-engineer": {
    id: "site-reliability-engineer",
    name: "Site Reliability Engineer (SRE)",
    category: "Cloud & DevOps",
    description: "Applies software engineering principles to operations, ensuring uptime, latency goals, and automated recovery.",
    benchmarkScore: 82,
    marketDemand: "High",
    averageSalary: "$145,000 - $195,000",
    skills: [
      { name: "SLIs, SLOs, and Error Budgets", category: "tools_arch", importance: "critical" },
      { name: "Distributed Tracing & APM (OpenTelemetry / Jaeger)", category: "tools_arch", importance: "critical" },
      { name: "Incident Management & Blameless Post-Mortems", category: "soft_skills", importance: "critical" },
      { name: "Linux Systems Internals & Performance Tuning", category: "core", importance: "critical" },
      { name: "Go / Python Automation Scripting", category: "core", importance: "critical" },
      { name: "Kubernetes Cluster Reliability & Auto-healing", category: "cloud_data", importance: "high" },
      { name: "Chaos Engineering (Gremlin / Chaos Mesh)", category: "tools_arch", importance: "high" },
      { name: "Capacity Planning & Traffic Sharding", category: "tools_arch", importance: "high" },
      { name: "Prometheus, Alertmanager & PagerDuty Integration", category: "tools_arch", importance: "high" },
      { name: "Database High Availability & Failover Automation", category: "cloud_data", importance: "high" },
      { name: "Cloud Infrastructure (AWS / GCP)", category: "cloud_data", importance: "high" },
      { name: "Toil Reduction & Automation", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Diagnosed", "Mitigated", "Automated", "Sustained 99.99% SLA", "Reduced MTTR", "Eliminated toil"],
    interviewFocus: [
      "Defining actionable SLOs vs vanity metrics",
      "Debugging live production bottlenecks under high packet drop",
      "Automated remediation without manual human intervention",
      "Designing disaster recovery drills and runbooks",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Linux", "Python", "Monitoring", "Docker"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["SLOs", "Prometheus", "Kubernetes", "Incident Response", "AWS"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["OpenTelemetry", "Chaos Engineering", "Toil Automation", "Multi-region DR"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Reliability Architecture", "Culture of Blamelessness", "High Availability Leadership"] },
    ],
  },

  "cybersecurity-engineer": {
    id: "cybersecurity-engineer",
    name: "Cybersecurity & AppSec Engineer",
    category: "Cloud & DevOps",
    description: "Protects applications, cloud assets, and networks against vulnerabilities, breaches, and unauthorized access.",
    benchmarkScore: 83,
    marketDemand: "Explosive",
    averageSalary: "$135,000 - $185,000",
    skills: [
      { name: "OWASP Top 10 & Application Security", category: "core", importance: "critical" },
      { name: "Vulnerability Scanning & SAST/DAST (Snyk / SonarQube)", category: "tools_arch", importance: "critical" },
      { name: "Identity & Access Management (IAM / Zero Trust / Okta)", category: "tools_arch", importance: "critical" },
      { name: "Penetration Testing & Ethical Hacking", category: "tools_arch", importance: "high" },
      { name: "Cloud Security Posture Management (CSPM / AWS GuardDuty)", category: "cloud_data", importance: "high" },
      { name: "SIEM & Security Monitoring (Splunk / Elastic / Datadog Security)", category: "tools_arch", importance: "high" },
      { name: "Compliance Standards (SOC 2 / ISO 27001 / GDPR / HIPAA)", category: "soft_skills", importance: "high" },
      { name: "Cryptographic Protocols & Key Management (KMS / TLS)", category: "core", importance: "high" },
      { name: "Threat Modeling & Risk Assessments", category: "soft_skills", importance: "high" },
      { name: "Incident Response & Forensics", category: "soft_skills", importance: "high" },
      { name: "DevSecOps & Secure CI/CD Integration", category: "tools_arch", importance: "high" },
      { name: "Network Security (Firewalls, WAF, DDoS Mitigation)", category: "cloud_data", importance: "bonus" },
    ],
    keyActionVerbs: ["Remediated", "Hardened", "Audited", "Thwarted", "Secured", "Standardized", "Enforced"],
    interviewFocus: [
      "Defending against SSRF, SQL Injection, and prototype pollution",
      "Automating shift-left security scans in PR workflows",
      "Incident triage during an active zero-day exploit disclosure",
      "Zero-trust architecture implementation roadmap",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["OWASP", "Vulnerability Scanning", "Network Basics", "Linux"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["SAST/DAST", "IAM", "Cloud Security", "Threat Modeling", "SOC 2"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Pen Testing", "DevSecOps", "Zero Trust", "Security Architecture"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Enterprise Security Governance", "Board Risk Reporting", "CISO Alignment"] },
    ],
  },

  "mobile-engineer": {
    id: "mobile-engineer",
    name: "Mobile App Engineer",
    category: "Engineering",
    description: "Develops fluid, performant native or cross-platform mobile apps for iOS and Android.",
    benchmarkScore: 79,
    marketDemand: "High",
    averageSalary: "$125,000 - $170,000",
    skills: [
      { name: "React Native or Flutter / Swift / Kotlin", category: "core", importance: "critical" },
      { name: "TypeScript / JavaScript or Dart", category: "core", importance: "critical" },
      { name: "iOS (SwiftUI / UIKit) & Android (Jetpack Compose)", category: "core", importance: "high" },
      { name: "Mobile State Management (Redux / MobX / Riverpod)", category: "tools_arch", importance: "high" },
      { name: "Offline-First Storage (SQLite / WatermelonDB / MMKV)", category: "cloud_data", importance: "high" },
      { name: "App Store & Google Play Release Lifecycle", category: "tools_arch", importance: "high" },
      { name: "Mobile CI/CD (Fastlane / Bitrise / EAS)", category: "tools_arch", importance: "high" },
      { name: "Push Notifications & Deep Linking (Firebase / OneSignal)", category: "cloud_data", importance: "high" },
      { name: "Mobile Performance & Memory Leak Profiling", category: "tools_arch", importance: "high" },
      { name: "Native Module Bridging", category: "core", importance: "bonus" },
      { name: "REST / GraphQL Mobile Consumption", category: "cloud_data", importance: "high" },
      { name: "Mobile UI/UX Polish & Haptics", category: "soft_skills", importance: "bonus" },
    ],
    keyActionVerbs: ["Shipped", "Built", "Optimized", "Refactored", "Published", "Scaled to 500K DAU", "Reduced bundle size"],
    interviewFocus: [
      "Bridge vs JSI architecture in React Native or Flutter engine thread pool",
      "Handling background state, battery constraints, and offline sync",
      "Automating screenshots and release tracks via Fastlane",
      "App launch time (Cold vs Warm start) optimizations",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["React Native or Flutter", "JavaScript/Dart", "Git", "Mobile Layouts"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Offline Storage", "State Management", "Fastlane", "Push Notifications"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Native Bridging", "Performance Profiling", "App Store Governance", "Architecture"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Mobile Engineering Standards", "Cross-Platform Strategy", "App Scalability"] },
    ],
  },

  "product-manager": {
    id: "product-manager",
    name: "Technical Product Manager",
    category: "Product & Design",
    description: "Guides technical roadmap, cross-functional execution, metrics tracking, and product strategy.",
    benchmarkScore: 78,
    marketDemand: "High",
    averageSalary: "$135,000 - $185,000",
    skills: [
      { name: "Product Strategy & Roadmap Formulation", category: "core", importance: "critical" },
      { name: "Product Requirement Documents (PRDs) & User Stories", category: "core", importance: "critical" },
      { name: "Agile / Scrum Sprint Leadership", category: "tools_arch", importance: "critical" },
      { name: "North Star Metrics & OKRs Definition", category: "tools_arch", importance: "critical" },
      { name: "User Research, Interviews & Feedback Synthesis", category: "soft_skills", importance: "high" },
      { name: "Data Analytics (Mixpanel / Amplitude / SQL)", category: "cloud_data", importance: "high" },
      { name: "A/B Testing & Feature Flagging (LaunchDarkly)", category: "tools_arch", importance: "high" },
      { name: "Cross-Functional Stakeholder Alignment", category: "soft_skills", importance: "high" },
      { name: "Competitive Analysis & Market Sizing", category: "soft_skills", importance: "high" },
      { name: "GTM (Go-To-Market) Execution & Launch Strategy", category: "soft_skills", importance: "high" },
      { name: "Technical Feasibility & System Understanding", category: "tools_arch", importance: "high" },
      { name: "Prioritization Frameworks (RICE / MoSCoW)", category: "tools_arch", importance: "bonus" },
    ],
    keyActionVerbs: ["Spearheaded", "Launched", "Grew ARR by", "Defined roadmap", "Increased retention", "Conducted user research"],
    interviewFocus: [
      "Prioritizing trade-offs between tech debt vs new feature velocity",
      "Designing a metric framework for a new feature launch",
      "Handling conflicting executive requirements",
      "Formulating hypothesis-driven product discovery",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["User Stories", "Agile", "Jira", "Customer Research"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["PRD", "Mixpanel/Amplitude", "A/B Testing", "Roadmapping", "SQL"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Product Vision", "GTM Execution", "P&L/ARR Impact", "Cross-Org Alignment"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Portfolio Strategy", "Executive Influence", "Organizational Scaling"] },
    ],
  },

  "ui-ux-designer": {
    id: "ui-ux-designer",
    name: "UI/UX & Product Designer",
    category: "Product & Design",
    description: "Crafts intuitive, accessible, visually compelling digital experiences and cohesive design systems.",
    benchmarkScore: 80,
    marketDemand: "Steady",
    averageSalary: "$115,000 - $160,000",
    skills: [
      { name: "Figma (Advanced Auto-Layout, Components, Variants)", category: "core", importance: "critical" },
      { name: "Design Systems & Token Architecture", category: "core", importance: "critical" },
      { name: "User Research & Usability Testing", category: "soft_skills", importance: "critical" },
      { name: "Wireframing & Information Architecture", category: "core", importance: "critical" },
      { name: "Interactive Prototyping (Figma / ProtoPie)", category: "tools_arch", importance: "high" },
      { name: "Web Accessibility (WCAG 2.1 AA / Color Contrast)", category: "tools_arch", importance: "high" },
      { name: "Developer Handoff & Spec Documentation", category: "soft_skills", importance: "high" },
      { name: "Mobile & Responsive Web Design Patterns", category: "core", importance: "high" },
      { name: "User Journey Mapping & Personas", category: "soft_skills", importance: "high" },
      { name: "Visual Hierarchy & Micro-Interactions", category: "core", importance: "high" },
      { name: "Basic HTML / CSS / Tailwind Knowledge", category: "tools_arch", importance: "bonus" },
      { name: "Quantitative Analytics (Hotjar / FullStory)", category: "cloud_data", importance: "bonus" },
    ],
    keyActionVerbs: ["Designed", "Standardized", "Prototyped", "Conducted research", "Elevated usability", "Reduced drop-off", "Created design system"],
    interviewFocus: [
      "Case study walkthrough with rationale behind design decisions",
      "Scaling a multi-brand or multi-platform design system in Figma",
      "Resolving developer implementation constraints without sacrificing UX",
      "Validating hypotheses with quantitative and qualitative metrics",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Figma", "Wireframes", "UI Design", "Prototyping"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Design Systems", "User Research", "WCAG", "Responsive Patterns"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["End-to-End Product Design", "Design Tokens", "Cross-Platform", "Mentorship"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Design Strategy", "Company Design Philosophy", "Design Ops"] },
    ],
  },

  "qa-sdet-engineer": {
    id: "qa-sdet-engineer",
    name: "QA & SDET Automation Engineer",
    category: "Product & Design",
    description: "Builds automated test suites, regression frameworks, and quality gates across web and API architectures.",
    benchmarkScore: 81,
    marketDemand: "High",
    averageSalary: "$120,000 - $165,000",
    skills: [
      { name: "Playwright / Cypress / Selenium Automation", category: "core", importance: "critical" },
      { name: "TypeScript / JavaScript or Python", category: "core", importance: "critical" },
      { name: "API Test Automation (Postman / Supertest / REST Assured)", category: "tools_arch", importance: "critical" },
      { name: "CI/CD Test Integration (GitHub Actions / Jenkins)", category: "cloud_data", importance: "critical" },
      { name: "Test Strategy & Defect Lifecycle Management", category: "soft_skills", importance: "high" },
      { name: "Performance & Load Testing (k6 / JMeter / Locust)", category: "tools_arch", importance: "high" },
      { name: "Dockerized Test Environments", category: "cloud_data", importance: "high" },
      { name: "BDD / TDD Frameworks (Cucumber / Jest / PyTest)", category: "tools_arch", importance: "high" },
      { name: "Cross-Browser & Visual Regression (Percy / Applitools)", category: "tools_arch", importance: "high" },
      { name: "SQL for Test Data Validation", category: "cloud_data", importance: "high" },
      { name: "Mobile Testing (Appium)", category: "tools_arch", importance: "bonus" },
      { name: "Quality Advocacy & Engineering Collaboration", category: "soft_skills", importance: "high" },
    ],
    keyActionVerbs: ["Automated", "Engineered test suites", "Cut regression time by", "Prevented defects", "Integrated CI/CD", "Executed load tests"],
    interviewFocus: [
      "Page Object Model and flaky test mitigation in Playwright",
      "Distributed parallel test execution in CI/CD runners",
      "API contract testing and mocking strategies",
      "Analyzing load test throughput and identifying database bottlenecks",
    ],
    seniorityLevels: [
      { level: "Junior", expectedYears: "0-2 years", mustHaveKeywords: ["Manual Testing", "Test Cases", "Basic Selenium or Playwright", "Git"] },
      { level: "Mid-Level", expectedYears: "2-5 years", mustHaveKeywords: ["Playwright or Cypress", "API Testing", "CI/CD Integration", "TypeScript"] },
      { level: "Senior", expectedYears: "5+ years", mustHaveKeywords: ["Framework Architecture", "k6 Performance", "Flakiness Governance", "Mentorship"] },
      { level: "Lead / Staff", expectedYears: "8+ years", mustHaveKeywords: ["Company Quality Strategy", "Test Automation Infrastructure", "Zero-Defect Culture"] },
    ],
  },
};

/**
 * High-quality sample resumes to allow 1-click test drive without needing a file upload
 */
export const SAMPLE_RESUMES = {
  frontend: {
    id: "sample-frontend",
    title: "Senior Frontend Engineer Resume (React & Next.js)",
    roleId: "frontend-engineer",
    candidate: {
      name: "Alex Morgan",
      email: "alex.morgan.dev@example.com",
      phone: "+1 (555) 234-5678",
      summary: "Senior Frontend Engineer with 6+ years of experience specializing in high-performance web applications, React 19, Next.js 14, TypeScript, and modern state architectures. Proven track record of improving Core Web Vitals (LCP reduced by 45%) and engineering enterprise design systems across 200k+ active users.",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "Tailwind CSS",
        "Zustand",
        "TanStack Query",
        "Vitest",
        "Playwright",
        "Core Web Vitals",
        "WCAG 2.1 Accessibility",
        "GraphQL",
        "Vite",
        "Turbopack",
        "Git",
        "CI/CD (GitHub Actions)",
      ],
      raw_text: `ALEX MORGAN
alex.morgan.dev@example.com | (555) 234-5678 | San Francisco, CA | github.com/alexmorgan | linkedin.com/in/alexmorgan

SUMMARY
Results-oriented Senior Frontend Engineer with 6+ years building scalable, accessible, and fast web applications. Deep expertise in React, Next.js App Router, TypeScript, and Tailwind CSS. Champion of Web Vitals and component architecture.

WORK EXPERIENCE
Senior Frontend Engineer | CloudMatrix Inc. | 2022 - Present
- Architected and spearheaded migration of flagship customer portal from legacy CRA to Next.js 14 App Router and TypeScript, reducing LCP by 45% and boosting SEO score to 98/100.
- Engineered reusable Design System in Figma and React with Tailwind CSS, utilized by 14 product teams, reducing frontend sprint delivery time by 30%.
- Implemented robust end-to-end testing pipeline with Playwright and Vitest in GitHub Actions, achieving 88% test coverage and cutting production regression tickets by 60%.
- Optimized state management using Zustand and TanStack Query, eliminating redundant re-renders and reducing client memory footprint by 35%.

Frontend Developer | InnovateTech Labs | 2019 - 2022
- Developed interactive analytics dashboards utilizing React, TypeScript, and D3.js handling real-time WebSocket feeds for 150K+ daily active users.
- Collaborated with UX designers to ensure WCAG 2.1 AA accessibility compliance across all user authentication and payment flows.
- Streamlined Vite and Webpack bundle configurations, slashing initial JavaScript payload size from 2.4MB to 480KB.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2015 - 2019

TECHNICAL SKILLS
Languages & Frameworks: React 18/19, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS
Tooling & Testing: Vitest, React Testing Library, Playwright, Vite, Turbopack, Git, Webpack
Architecture: Design Systems, Core Web Vitals, SSR/SSG, REST APIs, GraphQL, TanStack Query, Zustand`,
    },
  },

  ai: {
    id: "sample-ai",
    title: "AI & Machine Learning Engineer Resume (LLMs & RAG)",
    roleId: "ai-ml-engineer",
    candidate: {
      name: "Dr. Elena Rostova",
      email: "elena.rostova.ai@example.com",
      phone: "+1 (555) 876-5432",
      summary: "AI/ML Engineer with 5+ years building production-grade generative AI, RAG systems, and LLM fine-tuning pipelines. Experienced in PyTorch, LangChain, Pinecone, vLLM, and deploying models on AWS with GPU optimizations, serving over 2M automated queries monthly.",
      skills: [
        "Python",
        "PyTorch",
        "Large Language Models",
        "Retrieval-Augmented Generation (RAG)",
        "Vector Databases (Pinecone, Chroma)",
        "LangChain",
        "LlamaIndex",
        "Hugging Face",
        "Fine-Tuning (LoRA, PEFT)",
        "vLLM",
        "FastAPI",
        "Docker",
        "CUDA",
        "AWS SageMaker",
        "Pandas",
        "MLflow",
      ],
      raw_text: `DR. ELENA ROSTOVA
elena.rostova.ai@example.com | (555) 876-5432 | Seattle, WA | github.com/elenarostova | linkedin.com/in/elenarostova

SUMMARY
Innovative AI & Machine Learning Engineer specializing in Large Language Models (LLMs), RAG architectures, and model inference optimization. Proven ability to take applied AI research into low-latency production microservices.

WORK EXPERIENCE
Staff AI Engineer | NeuralScale AI | 2022 - Present
- Designed and deployed enterprise multi-tenant RAG platform using LangChain, LlamaIndex, and Pinecone vector database, serving 2M+ queries/month with sub-200ms latency.
- Fine-tuned open-source LLMs (Llama 3 70B, Mistral) using LoRA and QLoRA on domain-specific datasets, boosting factual accuracy by 34% compared to baseline GPT-3.5.
- Engineered high-throughput model serving infrastructure using vLLM and Triton Inference Server on AWS EKS with NVIDIA A100 GPUs, reducing token generation cost by 52%.
- Established automated hallucination benchmarking pipeline using RAGAS and custom LLM-as-a-judge evaluators, decreasing ungrounded outputs to under 1.2%.

Machine Learning Engineer | DataVision Technologies | 2020 - 2022
- Built end-to-end NLP classification and semantic search models using Hugging Face Transformers and PyTorch for customer ticket routing.
- Orchestrated MLOps pipelines with MLflow and Docker, reducing model retraining deployment cycle from 2 weeks to 4 hours.
- Collaborated with backend engineers to integrate Python FastAPI endpoints with Redis caching layers.

EDUCATION
Ph.D. in Computer Science (Machine Learning focus) | University of Washington | 2016 - 2020
B.S. in Applied Mathematics | University of Washington | 2012 - 2016

TECHNICAL SKILLS
AI & ML: PyTorch, Hugging Face, Transformers, LangChain, LlamaIndex, Scikit-Learn, LoRA, PEFT
Generative AI & Data: RAG, Vector DBs (Pinecone, Chroma, Qdrant, pgvector), vLLM, Triton, Pandas, NumPy
Cloud & DevOps: AWS (SageMaker, EKS, S3), Docker, CUDA, MLflow, FastAPI, Git`,
    },
  },

  fullstack: {
    id: "sample-fullstack",
    title: "Senior Fullstack & Cloud Engineer Resume (Node & Next.js)",
    roleId: "fullstack-developer",
    candidate: {
      name: "Marcus Vance",
      email: "marcus.vance.tech@example.com",
      phone: "+1 (555) 345-6789",
      summary: "Fullstack Engineer with 7 years architecting end-to-end cloud applications. Expert in Next.js, Node.js, TypeScript, PostgreSQL, and AWS. Proven experience leading product features that scaled from 0 to 500K active monthly users.",
      skills: [
        "TypeScript",
        "Next.js",
        "React",
        "Node.js",
        "PostgreSQL",
        "Prisma",
        "Docker",
        "AWS (ECS, S3, RDS)",
        "Redis",
        "Tailwind CSS",
        "REST APIs",
        "GraphQL",
        "GitHub Actions",
        "Jest",
      ],
      raw_text: `MARCUS VANCE
marcus.vance.tech@example.com | (555) 345-6789 | Austin, TX | github.com/marcusvance | linkedin.com/in/marcusvance

SUMMARY
Senior Fullstack Engineer with 7+ years of experience engineering secure, scalable web systems. Strong background in React/Next.js frontend, Node.js backend services, relational database optimization, and cloud infrastructure.

WORK EXPERIENCE
Lead Fullstack Engineer | ApexFin Tech | 2021 - Present
- Architected and shipped a multi-tenant B2B fintech SaaS platform using Next.js 14, Node.js, TypeScript, and PostgreSQL (Prisma ORM), scaling to $4M ARR in 24 months.
- Designed distributed asynchronous event queues using Redis and BullMQ, handling over 10M webhook requests daily with 99.99% reliability.
- Containerized entire application stack with Docker and established automated CI/CD deployment pipelines on AWS ECS Fargate via GitHub Actions.
- Conducted database indexing and query tuning in PostgreSQL, decreasing average API response times from 340ms to 42ms.

Full Stack Developer | NexaStream Digital | 2018 - 2021
- Built customer-facing dashboard features using React, Tailwind CSS, Express, and MongoDB.
- Integrated Stripe billing, webhooks, and subscription management handling over $1.5M in annual recurring transactions.
- Implemented OAuth2 and JWT authentication with role-based access control (RBAC).

EDUCATION
B.S. in Software Engineering | University of Texas at Austin | 2014 - 2018

TECHNICAL SKILLS
Languages & Frameworks: TypeScript, JavaScript, Next.js, React, Node.js, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, Prisma ORM, Redis, MongoDB, AWS (ECS, RDS, S3, CloudFront), Docker
DevOps & Tooling: GitHub Actions, Jest, REST APIs, GraphQL, Git, Postman`,
    },
  },
};
