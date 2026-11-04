"use client";

import React, { useState, useEffect } from "react";
import { signOut } from "@/app/actions";

interface DashboardClientProps {
  user: {
    email?: string;
  };
}

interface RoleData {
  name: string;
  score: number;
  skills: { name: string; match: boolean }[];
  jobs: { title: string; company: string; match: number; url: string }[];
}

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  summary: string;
  raw_text: string;
}

interface UrlAnalysis {
  jobTitle: string;
  company: string;
  location: string;
  atsScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: { type: string; title: string; description: string }[];
  interviewTips?: string[];
}

const ROLES_DATA: Record<string, RoleData> = {
  "Frontend Engineer": {
    name: "Frontend Engineer",
    score: 85,
    skills: [
      { name: "React / Next.js", match: true },
      { name: "TypeScript", match: true },
      { name: "Tailwind CSS", match: true },
      { name: "State Management (Redux/Zustand)", match: true },
      { name: "Web Accessibility (a11y)", match: false },
      { name: "Webpack / Vite Bundling", match: false },
      { name: "E2E Testing (Playwright/Cypress)", match: false },
    ],
    jobs: [
      { title: "Senior Frontend Engineer", company: "TechCorp Solutions", match: 89, url: "#" },
      { title: "React Developer", company: "Innovative Apps LLC", match: 85, url: "#" },
      { title: "UI/UX Engineer", company: "DesignGrid", match: 81, url: "#" },
    ],
  },
  "Fullstack Developer": {
    name: "Fullstack Developer",
    score: 72,
    skills: [
      { name: "React / Next.js", match: true },
      { name: "Node.js / Express", match: true },
      { name: "PostgreSQL / Prisma", match: true },
      { name: "RESTful & GraphQL APIs", match: true },
      { name: "TypeScript", match: false },
      { name: "Docker / Containerization", match: false },
      { name: "AWS Services (S3, EC2)", match: false },
    ],
    jobs: [
      { title: "Full Stack Engineer (Node/React)", company: "CloudScale Inc.", match: 78, url: "#" },
      { title: "Next.js Fullstack Developer", company: "Vercel Partner Agency", match: 74, url: "#" },
    ],
  },
  "Data Scientist": {
    name: "Data Scientist",
    score: 45,
    skills: [
      { name: "Python / Pandas", match: false },
      { name: "SQL Data Modeling", match: true },
      { name: "Machine Learning (Scikit-Learn)", match: false },
      { name: "PyTorch / TensorFlow", match: false },
      { name: "Data Visualization (Tableau/D3)", match: false },
      { name: "Statistics & Probability", match: true },
    ],
    jobs: [
      { title: "Data Analyst", company: "MetricGroup", match: 65, url: "#" },
    ],
  },
};

export default function DashboardClient({ user }: DashboardClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  const [animatedScore, setAnimatedScore] = useState(0);

  // Real-time API States
  const [uploadError, setUploadError] = useState("");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  // Tab & Scraping States
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"standard" | "url">("standard");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [urlAnalysisError, setUrlAnalysisError] = useState("");
  const [urlAnalysis, setUrlAnalysis] = useState<UrlAnalysis | null>(null);
  const [urlAnalyzerLogs, setUrlAnalyzerLogs] = useState<string[]>([]);

  // Live Job Feed States
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [isLoadingLiveJobs, setIsLoadingLiveJobs] = useState(false);
  const [liveJobsError, setLiveJobsError] = useState("");

  const activeRoleData = ROLES_DATA[selectedRole] || ROLES_DATA["Frontend Engineer"];

  const fetchLiveJobs = async (skillsList: string[]) => {
    setIsLoadingLiveJobs(true);
    setLiveJobsError("");
    try {
      const res = await fetch("/api/live-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: skillsList }),
      });
      if (!res.ok) {
        throw new Error("Failed to retrieve live jobs.");
      }
      const data = await res.json();
      setLiveJobs(data.jobs || []);
    } catch (err: any) {
      console.error(err);
      setLiveJobsError(err.message || "Failed to load job listings.");
    } finally {
      setIsLoadingLiveJobs(false);
    }
  };

  const handleResumeUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsUploading(true);
    setUploadProgress(10);
    setIsUploaded(false);
    setUploadError("");

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
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
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        skills: data.skills || [],
        summary: data.summary || "",
        raw_text: data.raw_text || "",
      });
      setIsUploaded(true);

      // Trigger live jobs fetch matching keywords
      fetchLiveJobs(data.skills || []);
    } catch (err: any) {
      console.error(err);
      setUploadError(
        err.message ||
          "Error processing resume. Please verify your Gemini API key in settings (top right)."
      );
      setFile(null);
      setFileName("");
      setIsUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleResumeUpload(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleResumeUpload(selected);
    }
  };

  const triggerReset = () => {
    setFile(null);
    setFileName("");
    setUploadProgress(0);
    setIsUploaded(false);
    setAnimatedScore(0);
    setParsedResume(null);
    setUrlAnalysis(null);
    setJobUrl("");
    setLiveJobs([]);
  };

  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl) return;
    setIsAnalyzingUrl(true);
    setUrlAnalysisError("");
    setUrlAnalyzerLogs(["[INFO] Connecting to job webpage...", "[INFO] Scraping source markup..."]);

    const logTimeout1 = setTimeout(() => {
      setUrlAnalyzerLogs((prev) => [...prev, "[INFO] Page content received. Extracting text node tree..."]);
    }, 850);

    const logTimeout2 = setTimeout(() => {
      setUrlAnalyzerLogs((prev) => [...prev, "[INFO] Cleaning templates. Matching keywords with resume..."]);
    }, 1800);

    const logTimeout3 = setTimeout(() => {
      setUrlAnalyzerLogs((prev) => [...prev, "[INFO] Evaluating ATS Gap Analysis via Gemini 1.5..."]);
    }, 3200);

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: jobUrl,
          resumeText: parsedResume ? parsedResume.raw_text : "",
        }),
      });

      clearTimeout(logTimeout1);
      clearTimeout(logTimeout2);
      clearTimeout(logTimeout3);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Web scan failed.");
      }

      const data = await res.json();
      setUrlAnalyzerLogs((prev) => [...prev, "[SUCCESS] Real-time ATS match scan completed!"]);
      setUrlAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setUrlAnalysisError(err.message || "Failed to analyze URL.");
      setUrlAnalyzerLogs((prev) => [...prev, `[ERROR] Scan aborted: ${err.message}`]);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  // Dynamic skill checking helper
  const checkSkillMatch = (skillName: string, resumeSkills: string[], resumeText: string) => {
    const normalizedText = resumeText.toLowerCase();
    const normalizedSkills = resumeSkills.map((s) => s.toLowerCase().trim());
    const skillLower = skillName.toLowerCase().trim();

    if (skillLower.includes("react") || skillLower.includes("next.js")) {
      return (
        normalizedText.includes("react") ||
        normalizedText.includes("next.js") ||
        normalizedText.includes("nextjs")
      );
    }
    if (skillLower.includes("typescript")) {
      return normalizedText.includes("typescript") || normalizedText.includes("ts");
    }
    if (skillLower.includes("tailwind")) {
      return normalizedText.includes("tailwind");
    }
    if (skillLower.includes("node") || skillLower.includes("express")) {
      return normalizedText.includes("node") || normalizedText.includes("express");
    }
    if (skillLower.includes("postgres") || skillLower.includes("prisma")) {
      return (
        normalizedText.includes("postgres") ||
        normalizedText.includes("prisma") ||
        normalizedText.includes("sql")
      );
    }
    if (skillLower.includes("python") || skillLower.includes("pandas")) {
      return normalizedText.includes("python") || normalizedText.includes("pandas");
    }
    return (
      normalizedText.includes(skillLower) ||
      normalizedSkills.some((s) => s.includes(skillLower) || skillLower.includes(s))
    );
  };

  const computedSkills = activeRoleData.skills.map((skill) => {
    const isMatched = parsedResume
      ? checkSkillMatch(skill.name, parsedResume.skills, parsedResume.raw_text)
      : false;
    return { name: skill.name, match: isMatched };
  });

  const activeRoleScore = parsedResume
    ? Math.round((computedSkills.filter((s) => s.match).length / computedSkills.length) * 100)
    : 0;

  // Animate the score wheel when uploaded state or role changes
  useEffect(() => {
    if (isUploaded) {
      setAnimatedScore(0);
      const target =
        activeAnalysisTab === "standard" ? activeRoleScore : urlAnalysis?.atsScore || 0;
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
        }, 15);
        return () => clearInterval(interval);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isUploaded, selectedRole, activeAnalysisTab, urlAnalysis, activeRoleScore]);

  // Circular gauge setup
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-ink-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-400">
              dashboard
            </p>
            <h1 className="font-display text-2xl text-ink-50 mt-1">
              Signed in as <span className="text-signal-300">{user?.email || "User"}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <form action={signOut}>
              <button type="submit" className="btn-ghost text-xs px-4 py-2 hover:bg-ink-800/40">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Left Column (Input Controls) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Box */}
            <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-xl transition-all">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                Step 01
              </p>
              <h2 className="mt-1 font-display text-lg text-ink-50">Upload Resume</h2>

              {uploadError && (
                <div className="mt-4 rounded-card border border-red-800 bg-red-950/60 p-4 text-xs text-red-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-red-300">Resume Analysis Failed</p>
                      <p className="leading-relaxed">{uploadError}</p>
                    </div>
                    <button
                      onClick={() => setUploadError("")}
                      className="text-red-400 hover:text-red-200 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {!file && !isUploading && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-4 flex flex-col items-center justify-center rounded-card border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-signal-400 bg-signal-500/5 scale-[0.99]"
                      : "border-ink-700 hover:border-ink-500 hover:bg-ink-850/50"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <svg
                    className="h-10 w-10 text-ink-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-ink-100">
                    Drag and drop your file here
                  </p>
                  <p className="mt-1 text-xs text-ink-500">PDF, DOCX, or TXT up to 5MB</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {isUploading && (
                <div className="mt-4 rounded-card border border-ink-800 bg-ink-950/50 p-6 text-center">
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span className="truncate max-w-[180px]">{fileName}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full bg-signal-500 transition-all duration-150 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 font-mono text-[10px] text-signal-400 uppercase tracking-widest animate-pulse-slow">
                    parsing text & extracting keywords...
                  </p>
                </div>
              )}

              {isUploaded && (
                <div className="mt-4 rounded-card border border-signal-600/30 bg-signal-500/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-signal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-ink-100 truncate max-w-[160px]">
                        {fileName}
                      </p>
                      {parsedResume?.name && (
                        <p className="text-[10px] text-signal-300 font-medium">
                          Candidate: {parsedResume.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={triggerReset} className="text-xs text-ink-400 hover:text-ink-200 underline">
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Role Target selection */}
            <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                Step 02
              </p>
              <h2 className="mt-1 font-display text-lg text-ink-50">Select Target Role</h2>
              <p className="text-xs text-ink-400 mt-1">
                Select your target career path to compute the ATS match check.
              </p>

              <div className="mt-4">
                <select
                  disabled={!isUploaded}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="field py-3 text-sm focus:border-signal-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column (Analysis Results) */}
          <div className="lg:col-span-3 space-y-6">
            {!isUploaded ? (
              <div className="flex h-full flex-col items-center justify-center rounded-card border border-dashed border-ink-750 bg-ink-900/30 p-12 text-center shadow-inner">
                <svg className="h-16 w-16 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 font-display text-lg text-ink-300">Analysis Awaiting</h3>
                <p className="mt-2 max-w-sm text-xs text-ink-500">
                  Please upload your resume and select a target role in Steps 1 and 2 to view ATS Score and gap assessment.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tab layout */}
                <div className="flex border-b border-ink-800">
                  <button
                    onClick={() => setActiveAnalysisTab("standard")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 px-4 ${
                      activeAnalysisTab === "standard"
                        ? "border-signal-500 text-signal-300 font-semibold"
                        : "border-transparent text-ink-400 hover:text-ink-200"
                    }`}
                  >
                    Target Career Path
                  </button>
                  <button
                    onClick={() => setActiveAnalysisTab("url")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 px-4 ${
                      activeAnalysisTab === "url"
                        ? "border-signal-500 text-signal-300 font-semibold"
                        : "border-transparent text-ink-400 hover:text-ink-200"
                    }`}
                  >
                    Scan Job Posting URL
                  </button>
                </div>

                {activeAnalysisTab === "standard" ? (
                  /* Standard career path matching */
                  <div className="grid gap-6 sm:grid-cols-5">
                    {/* Gauge Card */}
                    <div className="sm:col-span-2 rounded-card border border-ink-700 bg-ink-900 p-6 flex flex-col items-center justify-center text-center shadow-lg">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-4">
                        ATS Score
                      </p>
                      <div className="relative flex items-center justify-center h-28 w-28">
                        <svg className="absolute transform -rotate-90 w-full h-full">
                          <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-ink-800"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r={radius}
                            className="text-signal-500 gauge-circle"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <span className="font-display text-3xl font-bold text-ink-50">
                          {animatedScore}%
                        </span>
                      </div>
                      <span className="mt-4 text-xs font-semibold text-signal-400">
                        {animatedScore >= 80
                          ? "Excellent Match"
                          : animatedScore >= 60
                          ? "Good Match"
                          : "Needs Optimization"}
                      </span>
                    </div>

                    {/* Checklist Card */}
                    <div className="sm:col-span-3 rounded-card border border-ink-700 bg-ink-900 p-6 flex flex-col shadow-lg">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                        Skill Check
                      </p>
                      <h3 className="mt-1 font-display text-base text-ink-50">Role Gap Checklist</h3>

                      <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[140px] pr-1">
                        {computedSkills.map((skill, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {skill.match ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-signal-500/20 text-signal-400 font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold">
                                !
                              </span>
                            )}
                            <span className={skill.match ? "text-ink-300" : "text-ink-500 line-through"}>
                              {skill.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* URL-based matching content */
                  <div className="space-y-6 animate-fade-in">
                    <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-lg">
                      <h3 className="font-display text-base text-ink-50">Analyze Job Posting</h3>
                      <p className="text-xs text-ink-400 mt-1">
                        Input a link to a job posting (e.g. from Greenhouse, Lever, or any careers page) to parse it and run a real-time matching scan.
                      </p>

                      <form onSubmit={handleAnalyzeUrl} className="mt-4 flex gap-2">
                        <input
                          type="url"
                          value={jobUrl}
                          onChange={(e) => setJobUrl(e.target.value)}
                          placeholder="e.g. https://careers.google.com/jobs/results/..."
                          className="field flex-1"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isAnalyzingUrl}
                          className="btn-primary w-auto px-6 flex items-center justify-center gap-2 text-xs py-2 h-[42px]"
                        >
                          {isAnalyzingUrl ? "Scraping..." : "Scan URL"}
                        </button>
                      </form>

                      {urlAnalyzerLogs.length > 0 && (
                        <div className="mt-4 rounded-card border border-ink-800 bg-black/40 p-4 font-mono text-[10px] text-signal-400 space-y-1 overflow-y-auto max-h-32 shadow-inner">
                          {urlAnalyzerLogs.map((log, idx) => (
                            <div key={idx}>{log}</div>
                          ))}
                          {isAnalyzingUrl && <div className="animate-pulse inline-block">_</div>}
                        </div>
                      )}

                      {urlAnalysisError && (
                        <div className="mt-3 text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded">
                          {urlAnalysisError}
                        </div>
                      )}
                    </div>

                    {urlAnalysis && (
                      <div className="space-y-6">
                        {/* URL Score & Skills Checklist Row */}
                        <div className="grid gap-6 sm:grid-cols-5">
                          {/* Gauge Card */}
                          <div className="sm:col-span-2 rounded-card border border-ink-700 bg-ink-900 p-6 flex flex-col items-center justify-center text-center shadow-lg">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-4">
                              ATS Match
                            </p>
                            <div className="relative flex items-center justify-center h-28 w-28">
                              <svg className="absolute transform -rotate-90 w-full h-full">
                                <circle
                                  cx="56"
                                  cy="56"
                                  r={radius}
                                  className="text-ink-800"
                                  strokeWidth="8"
                                  stroke="currentColor"
                                  fill="transparent"
                                />
                                <circle
                                  cx="56"
                                  cy="56"
                                  r={radius}
                                  className="text-signal-500 gauge-circle"
                                  strokeWidth="8"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                />
                              </svg>
                              <span className="font-display text-3xl font-bold text-ink-50">
                                {urlAnalysis.atsScore}%
                              </span>
                            </div>
                            <span className="mt-4 text-xs font-semibold text-signal-400">
                              {urlAnalysis.atsScore >= 85
                                ? "Excellent Candidate"
                                : urlAnalysis.atsScore >= 60
                                ? "Moderate Candidate"
                                : "High Gap Profile"}
                            </span>
                          </div>

                          {/* URL Skills Checklist Card */}
                          <div className="sm:col-span-3 rounded-card border border-ink-700 bg-ink-900 p-6 flex flex-col shadow-lg">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                              Job Requirements
                            </p>
                            <h3 className="mt-1 font-display text-xs font-semibold text-ink-100 truncate">
                              {urlAnalysis.jobTitle} at {urlAnalysis.company}
                            </h3>

                            <div className="mt-4 space-y-2 overflow-y-auto max-h-[140px] pr-1">
                              {urlAnalysis.matchingSkills.map((skill, idx) => (
                                <div key={`match-${idx}`} className="flex items-center gap-2 text-xs">
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-signal-500/20 text-signal-400 font-bold text-[10px]">
                                    ✓
                                  </span>
                                  <span className="text-ink-300 font-medium">{skill}</span>
                                  <span className="text-[9px] text-signal-400 bg-signal-500/5 px-1.5 rounded">
                                    Matched
                                  </span>
                                </div>
                              ))}
                              {urlAnalysis.missingSkills.map((skill, idx) => (
                                <div key={`missing-${idx}`} className="flex items-center gap-2 text-xs">
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">
                                    !
                                  </span>
                                  <span className="text-ink-550 line-through">{skill}</span>
                                  <span className="text-[9px] text-red-450 bg-red-500/5 px-1.5 rounded">
                                    Gap Keyword
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Resume Suggestions Card */}
                        <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-lg">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                            optimization
                          </p>
                          <h3 className="mt-1 font-display text-base text-ink-50">Resume Tailoring Tips</h3>
                          <div className="mt-4 space-y-3">
                            {urlAnalysis.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="rounded-card border border-ink-800 bg-ink-950/40 p-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold text-ink-150 flex items-center gap-2">
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        suggestion.type === "keyword" ? "bg-cyan-500" : "bg-signal-400"
                                      }`}
                                    />
                                    {suggestion.title}
                                  </h4>
                                  <span className="text-[9px] uppercase font-mono bg-ink-800 px-1.5 py-0.5 rounded text-ink-400">
                                    {suggestion.type}
                                  </span>
                                </div>
                                <p className="text-xs text-ink-400 mt-2 leading-relaxed">
                                  {suggestion.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interview Tips Card */}
                        {urlAnalysis.interviewTips && urlAnalysis.interviewTips.length > 0 && (
                          <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-lg">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                              Preparation
                            </p>
                            <h3 className="mt-1 font-display text-base text-ink-50">AI Interview Prep Advice</h3>
                            <ul className="mt-3 list-disc pl-5 text-xs text-ink-400 space-y-1.5 leading-relaxed">
                              {urlAnalysis.interviewTips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Suggestions Section */}
                <div className="rounded-card border border-ink-700 bg-ink-900 p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                        Matches
                      </p>
                      <h3 className="mt-1 font-display text-base text-ink-50">Live Job Suggestions</h3>
                    </div>
                    {isLoadingLiveJobs && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-400 font-mono">
                        <svg className="animate-spin h-3.5 w-3.5 text-signal-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Fetching...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-ink-400 mt-1">
                    Real-time active listings fetched dynamically based on resume keywords:
                  </p>

                  {liveJobsError && (
                    <div className="mt-3 text-xs text-red-400">
                      Error fetching jobs: {liveJobsError}
                    </div>
                  )}

                  <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {liveJobs.length === 0 && !isLoadingLiveJobs ? (
                      <p className="text-xs text-ink-500 italic py-4 text-center">
                        No active jobs loaded. Please upload a resume to pull matching roles.
                      </p>
                    ) : (
                      liveJobs.map((job, idx) => (
                        <div
                          key={job.id || idx}
                          className="rounded-card border border-ink-800 bg-ink-950/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-ink-700 transition-all gap-4 group"
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-ink-50 group-hover:text-signal-300 transition-colors">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-400">
                              <span>{job.company}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              {job.salary && job.salary !== "Not listed" && (
                                <>
                                  <span>•</span>
                                  <span className="text-signal-400">{job.salary}</span>
                                </>
                              )}
                            </div>

                            {/* Skills matching badges */}
                            {((job.matchedSkills && job.matchedSkills.length > 0) ||
                              (job.missingSkills && job.missingSkills.length > 0)) && (
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {job.matchedSkills?.slice(0, 3).map((skill: string, sIdx: number) => (
                                  <span
                                    key={`matched-badge-${sIdx}`}
                                    className="text-[9px] font-mono text-signal-300 bg-signal-500/10 px-1.5 py-0.5 rounded"
                                  >
                                    ✓ {skill}
                                  </span>
                                ))}
                                {job.missingSkills?.slice(0, 2).map((skill: string, sIdx: number) => (
                                  <span
                                    key={`missing-badge-${sIdx}`}
                                    className="text-[9px] font-mono text-ink-550 bg-ink-850 px-1.5 py-0.5 rounded"
                                  >
                                    + {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-ink-850 pt-3 sm:border-0 sm:pt-0">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-signal-400 bg-signal-500/10 px-2 py-1 rounded">
                                {job.match}% match
                              </span>
                            </div>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost py-1.5 px-3 text-xs border-ink-750 hover:bg-ink-800 hover:border-ink-500 transition-all"
                            >
                              Apply
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
