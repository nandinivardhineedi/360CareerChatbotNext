export function getInterviewTips(domain, level, goal) {
  if (domain === "Data Science" && level === "Beginner") {
    return [
      "- Brush up basics of Python and Pandas.",
      "- Practice SQL queries and EDA.",
      "- Prepare for common HR & project-related questions."
    ];
  }
  // Add more for other combinations...
  return ["General advice: Be confident!"];
}
