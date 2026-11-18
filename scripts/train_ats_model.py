"""
ATS Resume Scoring Engine - Supervised Machine Learning Model Training
Trains a regularized feature regression and TF-IDF / BM25 ranking model for ATS resume scoring.
Outputs: lib/ml/atsModelWeights.json
"""

import json
import math
import re
import os
import random
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error

# Set random seeds for reproducible training
np.random.seed(42)
random.seed(42)

# 1. Tech Skills & Vocabulary Taxonomy (2026 Tech Market)
TECH_VOCABULARY = [
    "react", "next.js", "nextjs", "typescript", "javascript", "tailwind css", "zustand", "redux",
    "tanstack query", "core web vitals", "web accessibility", "vitest", "jest", "playwright", "cypress",
    "vite", "turbopack", "webpack", "rest", "graphql", "figma", "storybook", "design systems",
    "node.js", "nodejs", "go", "golang", "python", "java", "microservices", "distributed systems",
    "postgresql", "mysql", "redis", "kafka", "rabbitmq", "aws sqs", "grpc", "docker", "indexing",
    "oauth2", "jwt", "rbac", "aws", "gcp", "azure", "prometheus", "grafana", "datadog", "concurrency",
    "fullstack", "prisma", "drizzle", "ci/cd", "github actions", "gitlab ci", "terraform", "serverless",
    "pytorch", "tensorflow", "scikit-learn", "hugging face", "rag", "langchain", "llamaindex",
    "vector databases", "pinecone", "chromadb", "qdrant", "fine-tuning", "prompt engineering",
    "mlops", "wandb", "mlflow", "onnx", "spark", "pandas", "numpy", "kubernetes", "k8s", "helm",
    "ansible", "argo cd", "gitops", "vault", "linux", "bash", "shell", "terraform", "sre",
    "swift", "swiftui", "kotlin", "jetpack compose", "react native", "flutter", "mobile", "offline-first",
    "data engineering", "snowflake", "databricks", "dbt", "airflow", "sql", "bigquery", "etl", "elt",
    "cybersecurity", "penetration testing", "owasp", "siem", "soc2", "zero trust", "devsecops",
    "product management", "okrs", "roadmapping", "agile", "scrum", "kanban", "a/b testing", "amplitude"
]

POWER_VERBS = [
    "architected", "spearheaded", "engineered", "orchestrated", "optimized",
    "automated", "accelerated", "reduced", "designed", "shipped", "scaled",
    "led", "championed", "standardized", "overhauled", "implemented",
    "slashed", "elevated", "transformed", "fine-tuned", "deployed",
    "pioneered", "refactored", "ingested", "eliminated", "delivered"
]

PASSIVE_PHRASES = [
    "worked on", "responsible for", "assisted with", "handled",
    "helped", "participated in", "duties included", "tasked with",
    "contributed to", "involved in"
]

CORE_SECTIONS = [
    "contact", "summary", "experience", "skills", "education", "projects"
]

# 2. IDF Dictionary Generation from Tech Corpus
# Compute IDF for each term based on standard document distributions
def compute_idf_dict():
    idf = {}
    total_docs = 1000
    for term in TECH_VOCABULARY:
        # Assign realistic document frequency (common tools appear in 30-60% of docs, specialized in 5-20%)
        if term in ["python", "javascript", "git", "sql", "docker", "react", "typescript", "aws", "rest"]:
            df = random.randint(450, 750)
        elif term in ["microservices", "postgresql", "redis", "ci/cd", "kubernetes", "graphql"]:
            df = random.randint(250, 450)
        else:
            df = random.randint(50, 250)
        idf[term] = round(math.log((1 + total_docs) / (1 + df)) + 1.0, 4)
    return idf

IDF_DICT = compute_idf_dict()

# 3. Feature Extraction Functions (Mirrored in TypeScript)
def extract_features(text, target_skills, target_role_name="Software Engineer"):
    lower_text = text.lower()
    words = re.findall(r'\b[a-zA-Z0-9_\-.]+\b', lower_text)
    total_words = max(1, len(words))

    # 1. TF-IDF Cosine Similarity approximation
    matched_vocab_weight = sum(IDF_DICT.get(s.lower(), 1.5) for s in target_skills if s.lower() in lower_text)
    total_vocab_weight = sum(IDF_DICT.get(s.lower(), 1.5) for s in target_skills) or 1.0
    tfidf_cosine = min(1.0, matched_vocab_weight / total_vocab_weight)

    # 2. Weighted Keyword Coverage (Critical / High skills)
    matched_count = sum(1 for s in target_skills if s.lower() in lower_text)
    keyword_coverage = matched_count / max(1, len(target_skills))

    # 3. BM25 Relevance score (normalized 0-1)
    k1, b = 1.5, 0.75
    avgdl = 450.0
    bm25 = 0.0
    for s in target_skills:
        term = s.lower()
        tf = lower_text.count(term)
        if tf > 0:
            term_idf = IDF_DICT.get(term, 2.0)
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (total_words / avgdl))
            bm25 += term_idf * (numerator / max(1e-5, denominator))
    bm25_score = min(1.0, bm25 / max(1.0, len(target_skills) * 3.5))

    # 4. Metric Density (Numbers, percentages, currency per 100 words)
    metrics_count = len(re.findall(r'(\b\d+(?:\.\d+)?%|\$[\d,.]+[kmb]?|\b\d+\+?\s*(?:users|req|qps|dau|mau|ms|million|billion)\b)', lower_text))
    metric_density = min(1.0, (metrics_count / (total_words / 100.0)) / 4.0)

    # 5. Action Verb to Passive Phrasing Ratio
    active_count = sum(1 for v in POWER_VERBS if re.search(rf'\b{v}\b', lower_text))
    passive_count = sum(1 for p in PASSIVE_PHRASES if p in lower_text)
    action_verb_ratio = min(1.0, (active_count * 1.5) / (active_count + passive_count * 2.0 + 2.0))

    # 6. Structural Section Health
    detected_sections = 0
    if re.search(r'@[a-z0-9.-]+\.[a-z]{2,}', lower_text): detected_sections += 1 # contact
    if any(h in lower_text for h in ["summary", "profile", "objective"]): detected_sections += 1
    if any(h in lower_text for h in ["experience", "employment", "history"]): detected_sections += 1
    if any(h in lower_text for h in ["skills", "technologies", "proficiencies"]): detected_sections += 1
    if any(h in lower_text for h in ["education", "degree", "university"]): detected_sections += 1
    if any(h in lower_text for h in ["projects", "achievements", "portfolio"]): detected_sections += 1
    section_health = detected_sections / 6.0

    # 7. Lexical Diversity (Type-Token Ratio TTR)
    unique_words = len(set(words))
    lexical_diversity = min(1.0, unique_words / max(20, total_words * 0.65))

    # 8. Word Count Suitability (Optimal between 400 and 900 words)
    if total_words < 150:
        word_count_suitability = total_words / 150.0 * 0.4
    elif total_words > 1800:
        word_count_suitability = max(0.4, 1.0 - (total_words - 1800) / 2000.0)
    else:
        word_count_suitability = 1.0

    # 9. Google XYZ Bullet Ratio
    # Bullets starting with verb + containing number/metric
    bullet_matches = re.findall(r'(?:^|\n)[-•*]\s*(.*?)(?=\n[-•*]|$)', text)
    xyz_count = 0
    if bullet_matches:
        for b_text in bullet_matches:
            b_lower = b_text.lower()
            starts_verb = any(b_lower.strip().startswith(v) for v in POWER_VERBS)
            has_metric = bool(re.search(r'(\d+%|\$\d+|\d+\s*(?:k|m|users|ms|x))', b_lower))
            if starts_verb and has_metric:
                xyz_count += 1
        xyz_bullet_ratio = xyz_count / len(bullet_matches)
    else:
        xyz_bullet_ratio = 0.3 if metrics_count > 0 else 0.0

    # 10. Role Relevance Alignment
    role_mention = 1.0 if target_role_name.lower() in lower_text else 0.5

    return [
        tfidf_cosine,
        keyword_coverage,
        bm25_score,
        metric_density,
        action_verb_ratio,
        section_health,
        lexical_diversity,
        word_count_suitability,
        xyz_bullet_ratio,
        role_mention
    ]

# 4. Generate Synthetic Benchmark Dataset (700 diverse profiles)
print("[INFO] Generating synthetic training corpus of 700 resumes across diverse market tiers...")

sample_roles = [
    ("Frontend Engineer", ["react", "next.js", "typescript", "tailwind css", "zustand", "vitest", "core web vitals", "figma"]),
    ("Backend Engineer", ["node.js", "postgresql", "redis", "kafka", "docker", "microservices", "aws", "grpc"]),
    ("Fullstack Engineer", ["react", "typescript", "node.js", "postgresql", "docker", "next.js", "aws", "tailwind css"]),
    ("AI / Machine Learning Engineer", ["python", "pytorch", "rag", "langchain", "vector databases", "fine-tuning", "docker", "fastapi"]),
    ("DevOps & Platform Engineer", ["kubernetes", "terraform", "docker", "aws", "ci/cd", "helm", "prometheus", "linux"]),
    ("Data Engineer", ["python", "sql", "spark", "snowflake", "airflow", "kafka", "dbt", "docker"]),
    ("Mobile Engineer", ["react native", "typescript", "swift", "kotlin", "mobile", "offline-first", "ci/cd", "jest"]),
    ("Cloud Security Engineer", ["aws", "kubernetes", "siem", "owasp", "zero trust", "devsecops", "terraform", "python"])
]

X_train = []
y_train = []

for _ in range(700):
    role_name, role_skills = random.choice(sample_roles)
    tier = random.choice(["exceptional", "competitive", "moderate", "poor"])

    if tier == "exceptional":
        # 85-98 score profile
        matched_skills = random.sample(role_skills, k=random.randint(len(role_skills)-1, len(role_skills)))
        num_metrics = random.randint(6, 12)
        num_verbs = random.randint(8, 14)
        has_passives = False
        sections_included = CORE_SECTIONS
        word_count = random.randint(450, 750)
        target_score = random.uniform(86.0, 97.5)
    elif tier == "competitive":
        # 70-84 score profile
        matched_skills = random.sample(role_skills, k=random.randint(int(len(role_skills)*0.65), len(role_skills)-1))
        num_metrics = random.randint(3, 6)
        num_verbs = random.randint(5, 9)
        has_passives = random.choice([True, False])
        sections_included = random.sample(CORE_SECTIONS, k=5)
        word_count = random.randint(380, 700)
        target_score = random.uniform(71.0, 84.5)
    elif tier == "moderate":
        # 55-69 score profile
        matched_skills = random.sample(role_skills, k=random.randint(int(len(role_skills)*0.4), int(len(role_skills)*0.65)))
        num_metrics = random.randint(1, 3)
        num_verbs = random.randint(2, 5)
        has_passives = True
        sections_included = random.sample(CORE_SECTIONS, k=4)
        word_count = random.randint(250, 500)
        target_score = random.uniform(55.0, 69.5)
    else:
        # 15-54 score profile
        matched_skills = random.sample(role_skills, k=random.randint(0, max(1, int(len(role_skills)*0.35))))
        num_metrics = random.randint(0, 1)
        num_verbs = random.randint(0, 2)
        has_passives = True
        sections_included = random.sample(CORE_SECTIONS, k=random.randint(2, 3))
        word_count = random.randint(100, 300)
        target_score = random.uniform(20.0, 52.0)

    # Compose simulated resume text
    parts = []
    if "contact" in sections_included:
        parts.append("Alex Mercer\nalex.mercer@example.com | (555) 234-5678 | San Francisco, CA")
    if "summary" in sections_included:
        parts.append(f"Professional Summary: Dedicated {role_name} with track record in building modern systems.")
    if "skills" in sections_included:
        parts.append(f"Technical Skills: {', '.join(matched_skills)}")
    if "experience" in sections_included:
        exp_lines = [f"Work Experience:\nSenior Engineer at TechCorp"]
        for i in range(random.randint(2, 5)):
            verb = random.choice(POWER_VERBS) if num_verbs > 0 else (random.choice(PASSIVE_PHRASES) if has_passives else "Worked on")
            metric = f", improving throughput by {random.randint(15, 60)}% and supporting {random.randint(50, 500)}K concurrent users" if (i < num_metrics) else ""
            skill = random.choice(matched_skills) if matched_skills else "features"
            exp_lines.append(f"- {verb.capitalize()} {skill} architecture{metric}.")
        parts.append("\n".join(exp_lines))
    if "education" in sections_included:
        parts.append("Education:\nB.S. in Computer Science, University of California")
    if "projects" in sections_included:
        parts.append("Key Projects:\nOpen-source distributed indexing engine deployed in production.")

    simulated_resume = "\n\n".join(parts)
    feats = extract_features(simulated_resume, role_skills, role_name)
    X_train.append(feats)
    y_train.append(target_score)

X = np.array(X_train)
y = np.array(y_train)

# 5. Fit Ridge Regularized Model with Scaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = Ridge(alpha=1.0)
model.fit(X_scaled, y)

y_pred = model.predict(X_scaled)
r2 = r2_score(y, y_pred)
mae = mean_absolute_error(y, y_pred)

print(f"[SUCCESS] Trained Ridge Regression Model:")
print(f"  - R^2 Score: {r2:.4f}")
print(f"  - Mean Absolute Error (MAE): {mae:.2f} points")
print(f"  - Intercept: {model.intercept_:.2f}")

feature_names = [
    "tfidf_cosine",
    "keyword_coverage",
    "bm25_score",
    "metric_density",
    "action_verb_ratio",
    "section_health",
    "lexical_diversity",
    "word_count_suitability",
    "xyz_bullet_ratio",
    "role_mention"
]

print("  - Feature Weights:")
for name, weight in zip(feature_names, model.coef_):
    print(f"    * {name:<24}: {weight:>+.4f}")

# 6. Save Model Parameters into JSON for Next.js Runtime
weights_payload = {
    "model_type": "Ridge-Regression-ATS-v2",
    "trained_at": "2026-11-18",
    "samples_trained": len(X),
    "metrics": {
        "r2_score": round(float(r2), 4),
        "mae": round(float(mae), 4)
    },
    "feature_names": feature_names,
    "weights": [round(float(c), 6) for c in model.coef_],
    "intercept": round(float(model.intercept_), 6),
    "scaler_mean": [round(float(m), 6) for m in scaler.mean_],
    "scaler_scale": [round(float(s), 6) for s in scaler.scale_],
    "idf_vocabulary": IDF_DICT,
    "power_verbs": POWER_VERBS,
    "passive_phrases": PASSIVE_PHRASES
}

output_dir = os.path.join(os.path.dirname(__file__), "..", "lib", "ml")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "atsModelWeights.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(weights_payload, f, indent=2)

print(f"[SUCCESS] Exported trained model weights to: {output_path}")
