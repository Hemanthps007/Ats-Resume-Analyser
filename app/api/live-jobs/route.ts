import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { skills } = await request.json();
    const jsearchKey = process.env.RAPIDAPI_JSEARCH_KEY?.trim();

    // Use primary skill as the search term, default to "developer" if empty
    const primarySkill = skills && skills.length > 0 ? skills[0] : "developer";
    
    let jobs: any[] = [];

    if (jsearchKey) {
      // Fetch from JSearch
      const query = skills && skills.length > 0 ? skills.slice(0, 3).join(" ") : "Software Engineer";
      try {
        const jsearchRes = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`,
          {
            headers: {
              "X-RapidAPI-Key": jsearchKey,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
          }
        );
        if (jsearchRes.ok) {
          const jsearchData = await jsearchRes.json();
          jobs = (jsearchData.data || []).map((j: any) => ({
            id: j.job_id,
            title: j.job_title,
            company: j.employer_name,
            location: j.job_city && j.job_country ? `${j.job_city}, ${j.job_country}` : j.job_employment_type || "Remote",
            url: j.job_apply_link || j.job_google_link || "#",
            description: j.job_description || "",
            salary: j.job_min_salary ? `$${j.job_min_salary.toLocaleString()} - $${j.job_max_salary?.toLocaleString()}` : "Not listed",
            tags: j.job_required_skills || []
          }));
        } else {
          console.error("JSearch API error:", jsearchRes.statusText);
        }
      } catch (err) {
        console.error("Error querying JSearch:", err);
      }
    }

    // Fallback to Remotive if no JSearch jobs returned or no key provided
    if (jobs.length === 0) {
      // Query Remotive API
      const searchUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(primarySkill)}`;
      const remotiveRes = await fetch(searchUrl);
      if (remotiveRes.ok) {
        const data = await remotiveRes.json();
        jobs = (data.jobs || []).slice(0, 15).map((j: any) => ({
          id: String(j.id),
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || "Remote",
          url: j.url || "#",
          description: j.description || "",
          salary: j.salary || "Not listed",
          tags: j.tags || []
        }));
      } else {
        // Double fallback to general developer remote jobs
        const generalRes = await fetch(`https://remotive.com/api/remote-jobs?limit=15`);
        if (generalRes.ok) {
          const data = await generalRes.json();
          jobs = (data.jobs || []).slice(0, 10).map((j: any) => ({
            id: String(j.id),
            title: j.title,
            company: j.company_name,
            location: j.candidate_required_location || "Remote",
            url: j.url || "#",
            description: j.description || "",
            salary: j.salary || "Not listed",
            tags: j.tags || []
          }));
        }
      }
    }

    // Calculate dynamic matchScore based on resume skills
    const userSkills = (skills || []).map((s: string) => s.toLowerCase().trim());
    
    const jobsWithScores = jobs.map((job) => {
      let matchedCount = 0;
      const combinedText = `${job.title} ${job.description} ${(job.tags || []).join(" ")}`.toLowerCase();
      
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      userSkills.forEach((skill: string) => {
        if (!skill) return;
        if (combinedText.includes(skill)) {
          matchedCount++;
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });

      // Match score calculation
      let score = 40; // base score
      if (userSkills.length > 0) {
        score = Math.round((matchedCount / userSkills.length) * 100);
        // Constrain score between 35 and 99
        score = Math.max(35, Math.min(99, score));
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        salary: job.salary,
        match: score,
        matchedSkills: matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)), // capitalize
        missingSkills: missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      };
    });

    // Sort by match score descending
    jobsWithScores.sort((a, b) => b.match - a.match);

    return NextResponse.json({ success: true, jobs: jobsWithScores });
  } catch (error: any) {
    console.error("Live Jobs endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs." }, { status: 500 });
  }
}
