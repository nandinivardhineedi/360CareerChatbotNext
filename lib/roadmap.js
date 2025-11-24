// 360CareerChatbotNext\lib\roadmap.js

/**
 * Generates a career roadmap based on domain, level, and goal.
 * @param {string} domain - e.g., "Data Science"
 * @param {string} level - e.g., "Beginner", "Intermediate"
 * @param {string} goal - e.g., "Internship", "Job"
 */
const modules = {
  foundations: {
    "Beginner": {
      "Data Science": [
        "- Learn Python basics (variables, loops, functions)",
        "- Intro to statistics & probability",
        "- Practice with NumPy, Pandas"
      ],
      "Cybersecurity": [
        "- Learn networking basics (OSI model, TCP/IP)",
        "- Understand Linux commands & file systems",
        "- Practice with Wireshark or TryHackMe"
      ],
      "AI/ML": [
        "- Learn Python & NumPy",
        "- Understand linear algebra & probability",
        "- Explore basic ML concepts (supervised vs unsupervised)"
      ]
    }
  },
  core: {
    "Data Science": [
      "- Data cleaning & visualization (Matplotlib, Seaborn)",
      "- SQL for data queries",
      "- Mini projects: EDA on Kaggle datasets"
    ],
    "Cybersecurity": [
      "- Learn about vulnerabilities (OWASP Top 10)",
      "- Practice ethical hacking (Burp Suite, Nmap)",
      "- Capture The Flag (CTF) challenges"
    ],
    "AI/ML": [
      "- Learn Scikit-learn & model evaluation",
      "- Build regression/classification models",
      "- Work on image/text datasets"
    ]
  },
  projects: {
    "Internship": [
      "- Build 2–3 mini projects",
      "- Publish on GitHub with README",
      "- Apply via Internshala, LinkedIn"
    ],
    "Job": [
      "- Build a strong portfolio",
      "- Practice mock interviews",
      "- Apply to startups & MNCs"
    ]
  },
  bonus: {
    "Data Science": [
      "- Join communities (DataTalks, Analytics Vidhya)",
      "- Follow real-world case studies"
    ],
    "Cybersecurity": [
      "- Join Bug Bounty platforms (HackerOne, Bugcrowd)",
      "- Follow security blogs (Krebs, PortSwigger)"
    ]
  }
};

export function generateRoadmap(domain, level, goal) {
  const roadmap = [];

  roadmap.push(`📚 Foundations (${level})`);
  roadmap.push(...(modules.foundations[level]?.[domain] || []));

  roadmap.push(`\n🧠 Core Skills (${domain})`);
  roadmap.push(...(modules.core[domain] || []));

  roadmap.push(`\n🚀 Goal: ${goal}`);
  roadmap.push(...(modules.projects[goal] || []));

  if (modules.bonus[domain]) {
    roadmap.push(`\n🎓 Bonus`);
    roadmap.push(...modules.bonus[domain]);
  }

  return roadmap.join("\n");
}