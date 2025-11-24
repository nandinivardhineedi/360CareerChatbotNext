// 360CareerChatbotNext\lib\jobs.js
/**
 * Provides dummy job recommendations based on domain, level, and goal.
 * @param {{ domain: string, level: string, goal: string }} params - Object containing search parameters.
 */
// Example: Dummy job recommendations — replace with real API call logic
export async function getJobRecommendations({ domain, level, goal }) {
  if (domain === "Data Science" && goal === "Internship") {
    return [
      "- Data Science Intern at Analytics Vidhya (Remote)",
      "- Data Analyst Intern at KPMG India",
      "- Data Science Trainee at Kaggle Community"
    ];
  }
  // Add cases for other domains and goals...
  return ["No jobs found. Please refine your search."];
}