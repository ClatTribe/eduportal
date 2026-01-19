interface UserProfile {
  target_countries: string[];
  degree: string;
  program: string;
}

interface Scholarship {
  country_region?: string;
  degree_level?: string;
  scholarship_name?: string;
  detailed_eligibility?: string;
}

export const calculateMatchScore = (scholarship: Scholarship, userProfile: UserProfile | null): number => {
  if (!userProfile) return 0;

  let score = 0;

  if (userProfile.target_countries && userProfile.target_countries.length > 0) {
    if (
      scholarship.country_region === "All" ||
      userProfile.target_countries.includes(scholarship.country_region || "")
    ) {
      score += 50;
    }
  }

  if (userProfile.degree) {
    const userDegree = userProfile.degree.toLowerCase();
    const scholarshipLevel = (scholarship.degree_level || "").toLowerCase();

    if (
      userDegree === "bachelors" &&
      (scholarshipLevel.includes("undergraduate") || scholarshipLevel.includes("bachelor"))
    ) {
      score += 30;
    } else if (
      (userDegree === "masters" || userDegree === "master") &&
      (scholarshipLevel.includes("master") ||
        scholarshipLevel.includes("postgraduate") ||
        scholarshipLevel.includes("graduate"))
    ) {
      score += 30;
    } else if (userDegree === "phd" && scholarshipLevel.includes("phd")) {
      score += 30;
    }
    if (scholarshipLevel.includes("undergraduate") && scholarshipLevel.includes("postgraduate")) {
      score += 30;
    }
  }

  if (userProfile.program && scholarship.scholarship_name) {
    const userProgram = userProfile.program.toLowerCase();
    const scholarshipName = (scholarship.scholarship_name || "").toLowerCase();
    const eligibility = (scholarship.detailed_eligibility || "").toLowerCase();

    const programKeywords = userProgram.split(/[\s,\-/]+/).filter((k) => k.length > 2);
    let keywordMatches = 0;

    for (const keyword of programKeywords) {
      if (scholarshipName.includes(keyword) || eligibility.includes(keyword)) {
        keywordMatches++;
      }
    }

    const matchPercentage = keywordMatches / (programKeywords.length || 1);
    if (matchPercentage >= 0.5) score += 20;
    else if (matchPercentage >= 0.3) score += 15;
    else if (keywordMatches > 0) score += 10;
  }

  return score;
};