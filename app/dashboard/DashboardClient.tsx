"use client";

import React, { useState, useEffect, useMemo } from "react";
import { signOut } from "@/app/actions";
import {
  MARKET_ROLES,
  SAMPLE_RESUMES,
  MarketRole,
} from "@/lib/rolesData";
import {
  calculateAtsDiagnostics,
  AtsDiagnostics,
} from "@/lib/atsEngine";

interface DashboardClientProps {
  user: {
    email?: string;
  };
}

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  summary: string;
  raw_text: string;
}

interface JdOrUrlAnalysis {
  jobTitle: string;
  company: string;
  location: string;
  atsScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: { type: string; title: string; description: string }[];
  interviewTips?: string[];
}

interface BulletRewriteResult {
  original: string;
  rewrites: {
    style: string;
    text: string;
    actionVerb: string;
    metricHighlight: string;
  }[];
}

export default function DashboardClient({ user }: DashboardClientProps) {
  // Resume Intake States
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // Target Mode Selection
  const [targetMode, setTargetMode] = useState<"market_role" | "direct_jd" | "url_scan">("market_role");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("ai-ml-engineer");
  const [selectedSeniority, setSelectedSeniority] = useState<"Junior" | "Mid-Level" | "Senior" | "Lead / Staff">("Senior");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  // Direct JD Mode States
  const [jdText, setJdText] = useState("");
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [jdAnalysisError, setJdAnalysisError] = useState("");
  const [jdAnalysis, setJdAnalysis] = useState<JdOrUrlAnalysis | null>(null);

  // URL Scan Mode States
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [urlAnalysisError, setUrlAnalysisError] = useState("");
  const [urlAnalysis, setUrlAnalysis] = useState<JdOrUrlAnalysis | null>(null);
  const [urlAnalyzerLogs, setUrlAnalyzerLogs] = useState<string[]>([]);

  // Interactive Keyword Matrix Filter
  const [keywordCategoryFilter, setKeywordCategoryFilter] = useState<string>("all");
  const [activeKeywordModal, setActiveKeywordModal] = useState<{
    name: string;
    category: string;
    suggestedBullet: string;
  } | null>(null);

  // AI Bullet Point Rewriter Studio States
  const [bulletInput, setBulletInput] = useState("");
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);
  const [bulletRewriteError, setBulletRewriteError] = useState("");
  const [bulletRewriteResult, setBulletRewriteResult] = useState<BulletRewriteResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Live Job Feed States
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [isLoadingLiveJobs, setIsLoadingLiveJobs] = useState(false);
  const [liveJobsError, setLiveJobsError] = useState("");
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [remoteOnlyFilter, setRemoteOnlyFilter] = useState(false);

  // Animated Master Score
  const [animatedScore, setAnimatedScore] = useState(0);
  const [reportCopied, setReportCopied] = useState(false);

  const activeRole: MarketRole = MARKET_ROLES[selectedRoleId] || MARKET_ROLES["frontend-engineer"];

  // Compute multi-factor diagnostic report
  const diagnostics: AtsDiagnostics | null = useMemo(() => {
    if (!parsedResume) return null;
    return calculateAtsDiagnostics(parsedResume.raw_text, parsedResume.skills, activeRole);
  }, [parsedResume, activeRole]);

  // Target score based on active mode
  const currentEffectiveScore = useMemo(() => {
    if (targetMode === "market_role") {
      return diagnostics?.overallScore || 0;
    }
    if (targetMode === "direct_jd") {
      return jdAnalysis?.atsScore || 0;
    }
    if (targetMode === "url_scan") {
      return urlAnalysis?.atsScore || 0;
    }
    return 0;
  }, [targetMode, diagnostics, jdAnalysis, urlAnalysis]);

  // Animate the score wheel smoothly
  useEffect(() => {
    if (isUploaded) {
      setAnimatedScore(0);
      const target = currentEffectiveScore;
      const timeout = setTimeout(() => {
        let current = 0;
        const interval = setInterval(() => {
          current += 2;
          if (current >= target) {
            setAnimatedScore(target);
            clearInterval(interval);
          } else {
            setAnimatedScore(current);
          }
        }, 12);
        return () => clearInterval(interval);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isUploaded, currentEffectiveScore]);

  // Fetch Live Jobs
  const fetchLiveJobs = async (skillsList: string[]) => {
    setIsLoadingLiveJobs(true);
    setLiveJobsError("");
    try {
      const res = await fetch("/api/live-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsList }),
      });
      if (!res.ok) throw new Error("Failed to retrieve live jobs.");
      const data = await res.json();
      setLiveJobs(data.jobs || []);
    } catch (err: any) {
      console.error(err);
      setLiveJobsError(err.message || "Failed to load job listings.");
    } finally {
      setIsLoadingLiveJobs(false);
    }
  };

  // Upload Handler
  const handleResumeUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsUploading(true);
    setUploadProgress(15);
    setIsUploaded(false);
    setUploadError("");

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 12 : prev));
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to parse resume.");
      }

      const data = await res.json();
      setUploadProgress(100);
      setParsedResume({
        name: data.name || "Candidate",
        email: data.email || "",
        phone: data.phone || "",
        skills: data.skills || [],
        summary: data.summary || "",
        raw_text: data.raw_text || "",
      });
      setIsUploaded(true);
      fetchLiveJobs(data.skills || []);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Error processing resume. Please ensure the file is a valid PDF, DOCX, or TXT document.");
      setFile(null);
      setFileName("");
      setIsUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  // 1-Click Sample Resume Loader
  const loadSampleResume = (type: "frontend" | "ai" | "fullstack") => {
    const sample = SAMPLE_RESUMES[type];
    if (!sample) return;

    setFile(null);
    setFileName(`${sample.candidate.name} (Sample Resume)`);
    setUploadProgress(100);
    setIsUploading(false);
    setIsUploaded(true);
    setUploadError("");
    setParsedResume({
      name: sample.candidate.name,
      email: sample.candidate.email,
      phone: sample.candidate.phone,
      skills: sample.candidate.skills,
      summary: sample.candidate.summary,
      raw_text: sample.candidate.raw_text,
    });
    setSelectedRoleId(sample.roleId);
    setTargetMode("market_role");
    fetchLiveJobs(sample.candidate.skills);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleResumeUpload(droppedFile);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleResumeUpload(selected);
  };

  const triggerReset = () => {
    setFile(null);
    setFileName("");
    setUploadProgress(0);
    setIsUploaded(false);
    setAnimatedScore(0);
    setParsedResume(null);
    setUrlAnalysis(null);
    setJdAnalysis(null);
    setJobUrl("");
    setJdText("");
    setLiveJobs([]);
    setBulletRewriteResult(null);
  };

  // Direct JD Analysis Handler
  const handleAnalyzeJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setIsAnalyzingJd(true);
    setJdAnalysisError("");

    try {
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText,
          resumeText: parsedResume?.raw_text || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze Job Description.");
      }

      const data = await res.json();
      setJdAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setJdAnalysisError(err.message || "Failed to analyze Job Description.");
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  // URL Scraping Analysis Handler
  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl) return;
    setIsAnalyzingUrl(true);
    setUrlAnalysisError("");
    setUrlAnalyzerLogs(["[INFO] Connecting to job portal host...", "[INFO] Scraping clean DOM markup..."]);

    const t1 = setTimeout(() => {
      setUrlAnalyzerLogs((prev) => [...prev, "[INFO] Page received. Stripping nav/footers and extracting core JD requirements..."]);
    }, 900);
    const t2 = setTimeout(() => {
      setUrlAnalyzerLogs((prev) => [...prev, "[INFO] Evaluating ATS keyword match and gap density via trained ML model..."]);
    }, 1800);

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: jobUrl,
          resumeText: parsedResume ? parsedResume.raw_text : "",
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Web scan failed.");
      }

      const data = await res.json();
      setUrlAnalyzerLogs((prev) => [...prev, "[SUCCESS] ATS match analysis successfully completed!"]);
      setUrlAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setUrlAnalysisError(err.message || "Failed to analyze URL.");
      setUrlAnalyzerLogs((prev) => [...prev, `[ERROR] Scan aborted: ${err.message}`]);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  // AI Bullet Point Rewriter
  const handleRewriteBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletInput.trim()) return;
    setIsRewritingBullet(true);
    setBulletRewriteError("");

    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: bulletInput,
          targetRole: activeRole.name,
          keywords: diagnostics?.criticalMissing || [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to optimize bullet.");
      }

      const data = await res.json();
      setBulletRewriteResult(data);
    } catch (err: any) {
      console.error(err);
      setBulletRewriteError(err.message || "Failed to optimize bullet point.");
    } finally {
      setIsRewritingBullet(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Export Full Report to Clipboard
  const handleExportReport = () => {
    if (!diagnostics || !parsedResume) return;

    const reportText = `=====================================================
ATS RESUME RADAR — 2026 AUDIT REPORT
=====================================================
Candidate: ${parsedResume.name || "Candidate"}
Target Role: ${activeRole.name} (${selectedSeniority})
Overall ATS Score: ${diagnostics.overallScore}% (${diagnostics.ratingTier})

-----------------------------------------------------
4-PILLAR DIAGNOSTIC BREAKDOWN:
-----------------------------------------------------
- Keyword Alignment:      ${diagnostics.pillarScores.keywordMatch}%
- Quantified Impact:      ${diagnostics.pillarScores.quantifiedImpact}%
- Structural Health:      ${diagnostics.pillarScores.structuralHealth}%
- Dynamic Action Verbs:   ${diagnostics.pillarScores.actionVerbs}%

-----------------------------------------------------
CRITICAL MISSING KEYWORDS (${diagnostics.criticalMissing.length}):
-----------------------------------------------------
${diagnostics.criticalMissing.map((k) => `• ${k}`).join("\n")}

-----------------------------------------------------
ACTIONABLE RECOMMENDATIONS:
-----------------------------------------------------
${diagnostics.recommendations.map((r, i) => `${i + 1}. [${r.category}] ${r.title}\n   ${r.description}`).join("\n\n")}

Generated by ATS Resume Radar: 2026 Market Standard
`;

    navigator.clipboard.writeText(reportText);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  // Filtered Roles list
  const filteredRoles = Object.values(MARKET_ROLES).filter((r) =>
    r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  // Filtered Live Jobs
  const filteredLiveJobs = liveJobs.filter((j) => {
    const matchesSearch =
      !jobSearchTerm ||
      j.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(jobSearchTerm.toLowerCase());
    const matchesRemote = !remoteOnlyFilter || j.location.toLowerCase().includes("remote");
    return matchesSearch && matchesRemote;
  });

  // Circular gauge setup
  const radius = 44;
  const circumference = 2 * Math.PI * radius; // ~276.4
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100 px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & User Navigation */}
        <div className="flex flex-col gap-4 border-b border-ink-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-signal-500 to-cyber-cyan shadow-glow">
              <svg className="h-5 w-5 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">ATS Resume Radar</h1>
                <span className="rounded-full bg-signal-500/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-signal-400 border border-signal-500/30">
                  2026 Engine
                </span>
              </div>
              <p className="text-xs text-ink-400">
                Logged in as <span className="font-mono text-signal-300 font-semibold">{user?.email || "Candidate"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Quick Demo Resume Loaders */}
            <div className="flex items-center gap-1.5 rounded-lg border border-ink-800 bg-ink-900/80 p-1 text-xs">
              <span className="text-[11px] text-ink-400 px-2 font-mono hidden md:inline">Demo:</span>
              <button
                onClick={() => loadSampleResume("ai")}
                className="rounded px-2.5 py-1 text-[11px] font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
                title="Load sample AI/ML Engineer resume"
              >
                AI / ML
              </button>
              <button
                onClick={() => loadSampleResume("frontend")}
                className="rounded px-2.5 py-1 text-[11px] font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
                title="Load sample Frontend resume"
              >
                Frontend
              </button>
              <button
                onClick={() => loadSampleResume("fullstack")}
                className="rounded px-2.5 py-1 text-[11px] font-medium text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
                title="Load sample Fullstack resume"
              >
                Fullstack
              </button>
            </div>

            <form action={signOut}>
              <button type="submit" className="btn-ghost text-xs px-3.5 py-2 hover:border-red-500/40 hover:text-red-300">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Controls, Upload & Target Roles (5 Columns) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* STEP 1: RESUME INTAKE CARD */}
            <div className="glass-panel p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-signal-400">Step 01</p>
                  <h2 className="mt-0.5 font-display text-lg font-bold text-white">Upload Your Resume</h2>
                </div>
                {isUploaded && (
                  <button onClick={triggerReset} className="text-xs text-ink-400 hover:text-red-400 underline">
                    Clear / Reset
                  </button>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 rounded-card border border-red-800/80 bg-red-950/60 p-4 text-xs text-red-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-red-300">Resume Processing Failed</p>
                      <p className="mt-1 leading-relaxed">{uploadError}</p>
                    </div>
                    <button onClick={() => setUploadError("")} className="text-red-400 hover:text-red-200 text-sm font-bold">
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              {!isUploaded && !isUploading && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-signal-400 bg-signal-500/10 scale-[0.99]"
                      : "border-ink-750 hover:border-signal-500/50 hover:bg-ink-850/60"
                  }`}
                  onClick={() => document.getElementById("resume-input")?.click()}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-signal-400 mb-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white">Drop your resume here, or browse</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-400">Supports PDF, DOCX, or TXT (up to 5MB)</p>
                  <input
                    id="resume-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Uploading Progress State */}
              {isUploading && (
                <div className="mt-4 rounded-xl border border-ink-800 bg-ink-950/70 p-6 text-center">
                  <div className="flex items-center justify-between text-xs text-ink-300 font-mono">
                    <span className="truncate max-w-[200px]">{fileName}</span>
                    <span className="text-signal-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-signal-500 to-cyber-cyan transition-all duration-150 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 font-mono text-[10px] text-signal-400 uppercase tracking-widest animate-pulse">
                    Extracting skills & reconstructing ATS node tree...
                  </p>
                </div>
              )}

              {/* Uploaded Summary Card */}
              {isUploaded && parsedResume && (
                <div className="mt-4 rounded-xl border border-signal-500/30 bg-signal-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/20 text-signal-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[190px]">{fileName}</p>
                        <p className="text-[11px] text-signal-300 font-medium">{parsedResume.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRawText(!showRawText)}
                      className="text-[11px] font-mono text-ink-400 hover:text-white underline"
                    >
                      {showRawText ? "Hide Text" : "View Extracted"}
                    </button>
                  </div>

                  {/* Detected candidate info pill row */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-ink-300">
                    {parsedResume.email && <span className="bg-ink-800/80 px-2 py-0.5 rounded">✉ {parsedResume.email}</span>}
                    {parsedResume.phone && <span className="bg-ink-800/80 px-2 py-0.5 rounded">☎ {parsedResume.phone}</span>}
                    <span className="bg-signal-500/15 text-signal-300 px-2 py-0.5 rounded font-bold">
                      {parsedResume.skills.length} Skills Extracted
                    </span>
                  </div>

                  {/* Collapsible raw text view */}
                  {showRawText && (
                    <div className="rounded-lg border border-ink-800 bg-ink-950 p-3 max-h-48 overflow-y-auto font-mono text-[10px] text-ink-300 leading-relaxed whitespace-pre-wrap">
                      {parsedResume.raw_text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: TARGET SELECTION & MODES */}
            <div className="glass-panel p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-signal-400">Step 02</p>
                  <h2 className="mt-0.5 font-display text-lg font-bold text-white">Target Job & Analysis Mode</h2>
                </div>
              </div>

              {/* 3 Tab Mode Switcher */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-ink-950 p-1 border border-ink-800 text-xs">
                <button
                  onClick={() => setTargetMode("market_role")}
                  className={`rounded-lg py-2 font-medium transition-all ${
                    targetMode === "market_role"
                      ? "bg-signal-500 text-ink-950 font-bold shadow-sm"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  Market Roles
                </button>
                <button
                  onClick={() => setTargetMode("direct_jd")}
                  className={`rounded-lg py-2 font-medium transition-all ${
                    targetMode === "direct_jd"
                      ? "bg-signal-500 text-ink-950 font-bold shadow-sm"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  Paste JD
                </button>
                <button
                  onClick={() => setTargetMode("url_scan")}
                  className={`rounded-lg py-2 font-medium transition-all ${
                    targetMode === "url_scan"
                      ? "bg-signal-500 text-ink-950 font-bold shadow-sm"
                      : "text-ink-400 hover:text-white"
                  }`}
                >
                  URL Scanner
                </button>
              </div>

              {/* MODE 1: MARKET ROLES SELECTION */}
              {targetMode === "market_role" && (
                <div className="mt-5 space-y-4">
                  {/* Seniority Selector */}
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] text-ink-400 uppercase tracking-wider">
                      Seniority Level:
                    </label>
                    <div className="grid grid-cols-4 gap-1 rounded-lg bg-ink-950 p-1 border border-ink-800 text-[11px]">
                      {(["Junior", "Mid-Level", "Senior", "Lead / Staff"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedSeniority(level)}
                          className={`rounded py-1 text-center font-medium transition-all ${
                            selectedSeniority === level
                              ? "bg-ink-800 text-signal-300 font-bold border border-ink-700"
                              : "text-ink-400 hover:text-ink-200"
                          }`}
                        >
                          {level.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Search & Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono text-[11px] text-ink-400 uppercase tracking-wider">
                        Select Specialized Role (14+ Available):
                      </label>
                    </div>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="field py-3 text-sm focus:border-signal-400 cursor-pointer"
                    >
                      <optgroup label="Software Engineering">
                        <option value="frontend-engineer">Frontend Engineer</option>
                        <option value="backend-engineer">Backend Engineer</option>
                        <option value="fullstack-developer">Fullstack Developer</option>
                        <option value="mobile-engineer">Mobile App Engineer</option>
                      </optgroup>
                      <optgroup label="AI, Machine Learning & Data">
                        <option value="ai-ml-engineer">AI & Machine Learning Engineer</option>
                        <option value="data-scientist">Data Scientist</option>
                        <option value="data-engineer">Data Engineer</option>
                      </optgroup>
                      <optgroup label="Cloud, Infrastructure & Security">
                        <option value="devops-cloud-engineer">DevOps & Cloud Engineer</option>
                        <option value="site-reliability-engineer">Site Reliability Engineer (SRE)</option>
                        <option value="cybersecurity-engineer">Cybersecurity & AppSec Engineer</option>
                      </optgroup>
                      <optgroup label="Product, Design & Quality">
                        <option value="product-manager">Technical Product Manager</option>
                        <option value="ui-ux-designer">UI/UX & Product Designer</option>
                        <option value="qa-sdet-engineer">QA & SDET Automation Engineer</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Active Role Quick Metadata Badge Card */}
                  <div className="rounded-xl border border-ink-800 bg-ink-950/60 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{activeRole.name}</span>
                      <span className="rounded-full bg-signal-500/15 border border-signal-500/30 px-2 py-0.5 font-mono text-[10px] text-signal-400 font-bold">
                        {activeRole.marketDemand}
                      </span>
                    </div>
                    <p className="text-ink-400 text-[11px] leading-relaxed">{activeRole.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-ink-850 font-mono text-[11px]">
                      <span className="text-ink-500">Benchmark Avg:</span>
                      <span className="text-signal-300 font-semibold">{activeRole.averageSalary}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: DIRECT JD PASTE */}
              {targetMode === "direct_jd" && (
                <div className="mt-5 space-y-4">
                  <form onSubmit={handleAnalyzeJd} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-mono text-[11px] text-ink-400 uppercase tracking-wider">
                          Paste Job Description:
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setJdText(`Senior AI Engineer Job Description:
We are seeking a Senior AI/ML Engineer to lead our Generative AI and RAG architecture.
Required Qualifications:
- 5+ years with Python and deep learning frameworks (PyTorch or TensorFlow).
- Hands-on experience building Retrieval-Augmented Generation (RAG) pipelines with Pinecone, Chroma, or Qdrant vector databases.
- Fine-tuning open-source LLMs (Llama 3, Mistral) using LoRA or PEFT.
- Model inference serving with vLLM, Triton, or FastAPI in Docker containers.
- Strong knowledge of evaluation metrics (RAGAS) and reducing model hallucination.`)
                          }
                          className="text-[10px] text-signal-400 hover:underline"
                        >
                          Use Sample JD
                        </button>
                      </div>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the job requirements, qualifications, and duties from LinkedIn, Greenhouse, Indeed, or email..."
                        rows={6}
                        className="field resize-none text-xs leading-relaxed"
                        required
                      />
                    </div>

                    {jdAnalysisError && (
                      <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
                        {jdAnalysisError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAnalyzingJd || !jdText.trim() || !isUploaded}
                      className="btn-primary w-full py-2.5 text-xs font-semibold"
                    >
                      {isAnalyzingJd ? "Analyzing Alignment via ML Model..." : "Run Direct JD Gap Scan →"}
                    </button>
                    {!isUploaded && (
                      <p className="text-[10px] text-amber-400 text-center">
                        * Please upload or load a sample resume in Step 1 first.
                      </p>
                    )}
                  </form>
                </div>
              )}

              {/* MODE 3: URL SCAN */}
              {targetMode === "url_scan" && (
                <div className="mt-5 space-y-4">
                  <form onSubmit={handleAnalyzeUrl} className="space-y-3">
                    <div>
                      <label className="mb-1.5 block font-mono text-[11px] text-ink-400 uppercase tracking-wider">
                        Job Posting Webpage URL:
                      </label>
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://boards.greenhouse.io/... or careers portal link"
                        className="field text-xs"
                        required
                      />
                    </div>

                    {urlAnalyzerLogs.length > 0 && (
                      <div className="rounded-lg border border-ink-800 bg-black/50 p-3 font-mono text-[10px] text-signal-400 space-y-1 max-h-28 overflow-y-auto">
                        {urlAnalyzerLogs.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    )}

                    {urlAnalysisError && (
                      <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
                        {urlAnalysisError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAnalyzingUrl || !jobUrl || !isUploaded}
                      className="btn-primary w-full py-2.5 text-xs font-semibold"
                    >
                      {isAnalyzingUrl ? "Scraping & Parsing Portal..." : "Scan & Benchmark URL →"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* AI BULLET POINT REWRITER STUDIO CARD */}
            <div className="glass-panel p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyber-violet/20 text-cyber-violet font-bold text-xs">
                    XYZ
                  </div>
                  <h3 className="font-display text-base font-bold text-white">AI Bullet Point Enhancer</h3>
                </div>
                <span className="rounded bg-cyber-violet/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyber-violet border border-cyber-violet/20">
                  Google Formula
                </span>
              </div>
              <p className="text-xs text-ink-400 leading-relaxed mb-4">
                Paste any weak bullet point from your resume to transform it into a high-impact, metric-driven statement for <strong className="text-white">{activeRole.name}</strong>.
              </p>

              <form onSubmit={handleRewriteBullet} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    placeholder="e.g. Worked on frontend components and fixed bugs"
                    className="field text-xs pr-20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setBulletInput("Worked on backend APIs and helped improve database queries.")}
                    className="absolute right-2 top-2 text-[10px] text-signal-400 hover:underline"
                  >
                    Sample
                  </button>
                </div>

                {bulletRewriteError && (
                  <p className="text-xs text-red-400">{bulletRewriteError}</p>
                )}

                <button
                  type="submit"
                  disabled={isRewritingBullet || !bulletInput.trim()}
                  className="btn-cyber w-full py-2.5 text-xs font-semibold"
                >
                  {isRewritingBullet ? "Generating XYZ Variations..." : "Enhance Bullet with AI (3 Variations) →"}
                </button>
              </form>

              {/* Bullet Rewrite Results */}
              {bulletRewriteResult && (
                <div className="mt-4 space-y-3 pt-3 border-t border-ink-800">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    Optimized Variations (Ready to Copy):
                  </p>
                  {bulletRewriteResult.rewrites.map((r, i) => (
                    <div key={i} className="rounded-xl border border-ink-800 bg-ink-950/70 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyber-violet font-bold uppercase">{r.style}</span>
                        <button
                          onClick={() => copyToClipboard(r.text, i)}
                          className="rounded bg-ink-800 px-2 py-0.5 text-[10px] font-mono text-ink-300 hover:bg-signal-500 hover:text-ink-950 transition-colors"
                        >
                          {copiedIndex === i ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-ink-100 leading-relaxed font-sans">{r.text}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-ink-400">
                        <span>Verb: <strong className="text-signal-300">{r.actionVerb}</strong></span>
                        <span>•</span>
                        <span>Impact: <strong className="text-cyber-cyan">{r.metricHighlight}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Diagnostic Scores & Matrix Results (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {!isUploaded ? (
              /* AWAITING RESUME PLACEHOLDER */
              <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-800 bg-ink-900/30 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-850 text-signal-400 shadow-glow mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-white">Awaiting Resume Intake</h3>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-ink-400">
                  Upload your resume in Step 1 (or load a sample resume from the top bar) to trigger the full 2026 ATS diagnostic breakdown, keyword matrix, and live job matching.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => loadSampleResume("ai")}
                    className="btn-ghost text-xs px-4 py-2 hover:border-signal-500/50"
                  >
                    ⚡ Test with AI Engineer Resume
                  </button>
                  <button
                    onClick={() => loadSampleResume("frontend")}
                    className="btn-ghost text-xs px-4 py-2 hover:border-signal-500/50"
                  >
                    ⚡ Test with Frontend Resume
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE DIAGNOSTIC DASHBOARD */
              <div className="space-y-6">
                {/* 1. MASTER SCORE & 4 PILLARS CARD */}
                <div className="glass-panel p-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-800 pb-4 mb-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-signal-400">
                        {targetMode === "market_role" ? "Market Role Benchmark" : targetMode === "direct_jd" ? "Direct JD Match" : "Job Portal Match"}
                      </p>
                      <h3 className="font-display text-xl font-bold text-white">
                        {targetMode === "market_role" ? activeRole.name : targetMode === "direct_jd" ? jdAnalysis?.jobTitle || "Job Description Match" : urlAnalysis?.jobTitle || "URL Job Scan"}
                      </h3>
                    </div>
                    <button
                      onClick={handleExportReport}
                      className="btn-ghost text-xs px-3.5 py-1.5 self-start sm:self-auto"
                    >
                      {reportCopied ? "✓ Audit Report Copied!" : "📋 Copy Full ATS Audit"}
                    </button>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-12 items-center">
                    {/* Master Circular Gauge (5 cols) */}
                    <div className="sm:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-ink-800 bg-ink-950/70">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-2">Master ATS Score</p>
                      <div className="relative flex items-center justify-center h-32 w-32">
                        <svg className="h-full w-full -rotate-90">
                          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="9" fill="transparent" className="text-ink-800" />
                          <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="9"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="text-signal-400 gauge-circle"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="font-display text-3xl font-extrabold text-white">{animatedScore}%</span>
                        </div>
                      </div>
                      <span className={`mt-3 rounded-full border px-3 py-0.5 font-mono text-[11px] font-bold ${diagnostics?.ratingColor || "text-signal-300"}`}>
                        {diagnostics?.ratingTier || "Active"}
                      </span>
                      <p className="mt-2 text-[11px] text-ink-400 px-2 leading-relaxed">
                        {diagnostics?.summaryFeedback}
                      </p>
                    </div>

                    {/* 4 Diagnostic Pillars (7 cols) */}
                    <div className="sm:col-span-7 space-y-3.5">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                        4 Diagnostic Scoring Pillars:
                      </p>

                      {/* Pillar 1: Keywords */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-ink-200">1. Keyword Alignment (35%)</span>
                          <span className="text-signal-400 font-bold">{diagnostics?.pillarScores.keywordMatch || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                          <div
                            className="h-full bg-signal-400 transition-all duration-700"
                            style={{ width: `${diagnostics?.pillarScores.keywordMatch || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Pillar 2: Metrics */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-ink-200">2. Quantified Impact & Metrics (25%)</span>
                          <span className="text-cyber-cyan font-bold">{diagnostics?.pillarScores.quantifiedImpact || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                          <div
                            className="h-full bg-cyber-cyan transition-all duration-700"
                            style={{ width: `${diagnostics?.pillarScores.quantifiedImpact || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Pillar 3: Structure */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-ink-200">3. ATS Structural Health (20%)</span>
                          <span className="text-cyber-violet font-bold">{diagnostics?.pillarScores.structuralHealth || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                          <div
                            className="h-full bg-cyber-violet transition-all duration-700"
                            style={{ width: `${diagnostics?.pillarScores.structuralHealth || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Pillar 4: Action Verbs */}
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span className="text-ink-200">4. Dynamic Action Verbs (20%)</span>
                          <span className="text-amber-400 font-bold">{diagnostics?.pillarScores.actionVerbs || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-ink-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 transition-all duration-700"
                            style={{ width: `${diagnostics?.pillarScores.actionVerbs || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. INTERACTIVE KEYWORD MATRIX & GAP RADAR */}
                {targetMode === "market_role" && diagnostics && (
                  <div className="glass-panel p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-signal-400">Market Keyword Matrix</p>
                        <h3 className="font-display text-base font-bold text-white">
                          Target Competencies for {activeRole.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        <span className="text-signal-300 font-bold">{diagnostics.matchedSkillsCount}</span>
                        <span className="text-ink-400">of</span>
                        <span className="text-white font-bold">{diagnostics.totalSkillsCount} Matched</span>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 border-b border-ink-800/80 pb-3">
                      {[
                        { id: "all", label: "All Skills" },
                        { id: "core", label: "Core Tech" },
                        { id: "cloud_data", label: "Cloud & Data" },
                        { id: "tools_arch", label: "Architecture & Tools" },
                        { id: "soft_skills", label: "Soft & Leadership" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setKeywordCategoryFilter(cat.id)}
                          className={`rounded-full px-3 py-0.5 text-[11px] font-mono transition-colors ${
                            keywordCategoryFilter === cat.id
                              ? "bg-signal-500 text-ink-950 font-bold"
                              : "bg-ink-850 text-ink-400 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Skills Grid */}
                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                      {diagnostics.skills
                        .filter((s) => keywordCategoryFilter === "all" || s.category === keywordCategoryFilter)
                        .map((skill, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (!skill.match) {
                                setActiveKeywordModal({
                                  name: skill.name,
                                  category: skill.category,
                                  suggestedBullet: skill.suggestedBullet || `Integrated ${skill.name} to optimize production workflows.`,
                                });
                              }
                            }}
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-all ${
                              skill.match
                                ? "border-signal-500/30 bg-signal-500/10 text-signal-300 cursor-default"
                                : skill.importance === "critical"
                                ? "border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400 hover:bg-red-500/20 cursor-pointer"
                                : "border-ink-750 bg-ink-850/80 text-ink-400 hover:border-ink-600 hover:text-ink-200 cursor-pointer"
                            }`}
                            title={skill.match ? "Matched in resume" : "Click to view recommended bullet"}
                          >
                            <span>{skill.match ? "✓" : "!"}</span>
                            <span className={skill.match ? "font-medium" : "line-through opacity-80"}>
                              {skill.name}
                            </span>
                            {!skill.match && (
                              <span className="text-[9px] bg-red-500/20 px-1 rounded text-red-300 font-bold">
                                {skill.importance === "critical" ? "MUST HAVE" : "GAP"}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>

                    {/* Click-to-fix Modal / Card for Missing Keywords */}
                    {activeKeywordModal && (
                      <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-red-300 font-bold">
                            Missing Keyword Fix: {activeKeywordModal.name}
                          </span>
                          <button
                            onClick={() => setActiveKeywordModal(null)}
                            className="text-xs text-ink-400 hover:text-white"
                          >
                            ✕ Close
                          </button>
                        </div>
                        <p className="text-xs text-ink-300 leading-relaxed font-sans">
                          {activeKeywordModal.suggestedBullet}
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => copyToClipboard(activeKeywordModal.suggestedBullet, 999)}
                            className="rounded bg-signal-500 px-3 py-1 text-[11px] font-semibold text-ink-950 hover:bg-signal-400"
                          >
                            {copiedIndex === 999 ? "✓ Copied to Clipboard!" : "Copy Suggested Bullet"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DIRECT JD OR URL SCAN RESULTS */}
                {(jdAnalysis || urlAnalysis) && (
                  <div className="glass-panel p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-ink-800 pb-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-signal-400">Scanned Requirements</p>
                        <h4 className="font-display text-sm font-bold text-white">
                          {(jdAnalysis || urlAnalysis)?.jobTitle} at {(jdAnalysis || urlAnalysis)?.company}
                        </h4>
                      </div>
                      <span className="rounded bg-signal-500/10 px-2 py-1 font-mono text-xs font-bold text-signal-400">
                        {(jdAnalysis || urlAnalysis)?.location}
                      </span>
                    </div>

                    {/* Matched vs Missing Tags */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[10px] text-signal-400 uppercase tracking-wider mb-2">Matching Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {(jdAnalysis || urlAnalysis)?.matchingSkills.map((s, i) => (
                            <span key={i} className="rounded bg-signal-500/15 border border-signal-500/30 px-2 py-0.5 font-mono text-[11px] text-signal-300">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] text-red-400 uppercase tracking-wider mb-2">Missing Gaps:</p>
                        <div className="flex flex-wrap gap-1">
                          {(jdAnalysis || urlAnalysis)?.missingSkills.map((s, i) => (
                            <span key={i} className="rounded bg-red-500/15 border border-red-500/30 px-2 py-0.5 font-mono text-[11px] text-red-300">
                              ✕ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions list */}
                    {((jdAnalysis || urlAnalysis)?.suggestions || []).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-ink-800 space-y-2">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Tailoring Advice:</p>
                        {((jdAnalysis || urlAnalysis)?.suggestions || []).map((sug, i) => (
                          <div key={i} className="rounded-lg border border-ink-800 bg-ink-950/60 p-3 text-xs">
                            <span className="font-semibold text-white font-mono">{sug.title}: </span>
                            <span className="text-ink-300 leading-relaxed font-sans">{sug.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ACTIONABLE RECOMMENDATIONS & INTERVIEW PREP */}
                {diagnostics && diagnostics.recommendations.length > 0 && (
                  <div className="glass-panel p-6 shadow-xl space-y-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-signal-400">Optimization Roadmap</p>
                    <h3 className="font-display text-base font-bold text-white">Priority Improvements</h3>
                    <div className="space-y-3">
                      {diagnostics.recommendations.map((rec, i) => (
                        <div key={i} className="rounded-xl border border-ink-800 bg-ink-950/70 p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-signal-400" />
                              {rec.title}
                            </h4>
                            <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-ink-800 text-ink-400 font-bold">
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-xs text-ink-300 leading-relaxed font-sans pt-1">
                            {rec.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Interview Focus Topics */}
                    <div className="mt-6 pt-4 border-t border-ink-800">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-cyan mb-2">
                        Common Interview Focus for {activeRole.name}:
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2 text-xs text-ink-300">
                        {activeRole.interviewFocus.map((focus, i) => (
                          <li key={i} className="flex items-start gap-2 rounded-lg border border-ink-800 bg-ink-900/60 p-2.5">
                            <span className="text-cyber-cyan font-bold">•</span>
                            <span>{focus}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 5. LIVE JOBS RADAR WITH KEYWORD MATCHING */}
                <div className="glass-panel p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-signal-400">Direct Radar</p>
                      <h3 className="font-display text-base font-bold text-white">Matching Live Job Openings</h3>
                    </div>
                    {isLoadingLiveJobs && (
                      <span className="flex items-center gap-1.5 font-mono text-xs text-signal-400 animate-pulse">
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Scanning live openings...
                      </span>
                    )}
                  </div>

                  {/* Search & Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={jobSearchTerm}
                      onChange={(e) => setJobSearchTerm(e.target.value)}
                      placeholder="Filter by title or company..."
                      className="field text-xs py-2 flex-1"
                    />
                    <button
                      onClick={() => setRemoteOnlyFilter(!remoteOnlyFilter)}
                      className={`rounded-lg px-3 py-2 text-xs font-mono font-medium border transition-colors ${
                        remoteOnlyFilter
                          ? "bg-signal-500/20 border-signal-500 text-signal-300"
                          : "border-ink-800 bg-ink-900 text-ink-400 hover:text-white"
                      }`}
                    >
                      {remoteOnlyFilter ? "✓ Remote Only" : "Remote Only"}
                    </button>
                  </div>

                  {liveJobsError && (
                    <p className="text-xs text-red-400">{liveJobsError}</p>
                  )}

                  {/* Jobs List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredLiveJobs.length === 0 && !isLoadingLiveJobs ? (
                      <p className="text-xs text-ink-500 italic py-6 text-center">
                        No active jobs matching this filter.
                      </p>
                    ) : (
                      filteredLiveJobs.map((job, idx) => (
                        <div
                          key={job.id || idx}
                          className="rounded-xl border border-ink-800 bg-ink-950/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-ink-700 transition-all group"
                        >
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-white group-hover:text-signal-300 transition-colors">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                              <span className="text-ink-200">{job.company}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              {job.salary && job.salary !== "Not listed" && (
                                <>
                                  <span>•</span>
                                  <span className="text-signal-400 font-mono">{job.salary}</span>
                                </>
                              )}
                            </div>

                            {/* Skills badges */}
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {job.matchedSkills?.slice(0, 3).map((s: string, i: number) => (
                                <span key={i} className="rounded bg-signal-500/10 px-1.5 py-0.5 font-mono text-[9px] text-signal-300">
                                  ✓ {s}
                                </span>
                              ))}
                              {job.missingSkills?.slice(0, 2).map((s: string, i: number) => (
                                <span key={i} className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[9px] text-ink-400">
                                  + {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-ink-850 pt-3 sm:border-0 sm:pt-0">
                            <span className="rounded-lg bg-signal-500/15 border border-signal-500/30 px-2.5 py-1 font-mono text-xs font-bold text-signal-400">
                              {job.match}% match
                            </span>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost py-1.5 px-3 text-xs"
                            >
                              Apply →
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
