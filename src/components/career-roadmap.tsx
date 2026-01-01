import { CheckCircle2 } from "lucide-react";

type RoadmapData = {
  [key: string]: {
    year1: string[];
    year3: string[];
    year5: string[];
  };
};

const roadmapData: RoadmapData = {
  "Software Engineering": {
    year1: ["Complete 12th grade with a focus on Physics, Chemistry, and Math (PCM)", "Start learning a programming language like Python or JavaScript", "Build a simple personal project, like a website or a small game"],
    year3: ["Get into a good engineering college for a B.Tech in Computer Science", "Participate in hackathons and coding competitions", "Secure an internship in a tech company"],
    year5: ["Graduate with a strong portfolio of projects", "Land a job as a Software Development Engineer (SDE 1)", "Contribute to a real-world product"],
  },
  "Doctor": {
    year1: ["Complete 12th grade with a focus on Physics, Chemistry, and Biology (PCB)", "Prepare for and score well in the NEET exam", "Volunteer at a local clinic or hospital"],
    year3: ["Secure admission to a reputable medical college for MBBS", "Focus on understanding foundational medical subjects", "Develop good clinical observation skills"],
    year5: ["Complete the first few years of your MBBS degree", "Start clinical rotations in different departments", "Decide on an area of interest for future specialization"],
  },
  "Data Science": {
    year1: ["Complete 12th grade with Math and preferably Computer Science", "Learn foundational statistics and probability", "Start a course on data analysis with Python"],
    year3: ["Pursue a degree in Statistics, Math, or Computer Science", "Work on data analysis projects with real datasets", "Do an internship as a Data Analyst"],
    year5: ["Graduate and start a Master's program in Data Science or a related field", "Master machine learning algorithms", "Get a job as a Junior Data Scientist"],
  },
  "UX/UI Design": {
    year1: ["Complete 12th grade, preferably from an Arts or Commerce stream", "Start learning design principles and psychology", "Build a portfolio with mock design projects for apps or websites"],
    year3: ["Enroll in a Bachelor of Design (B.Des) or a similar design course", "Master design tools like Figma", "Get an internship as a UI/UX design trainee"],
    year5: ["Graduate with a strong design portfolio", "Land a job as a Junior UX/UI Designer", "Work on designing features for a live product"],
  },
  "Graphic Design": {
    year1: ["Complete 12th grade, preferably from the Arts stream", "Develop sketching and illustration skills", "Become proficient in Adobe Illustrator and Photoshop"],
    year3: ["Pursue a degree in Fine Arts or a diploma in Graphic Design", "Create a diverse portfolio (branding, social media, etc.)", "Freelance for small clients to gain experience"],
    year5: ["Graduate and get a job at a design studio or marketing agency", "Work on branding projects for various clients", "Develop a unique design style"],
  },
  "Marketing": {
    year1: ["Complete 12th grade, preferably from the Commerce stream", "Read books on marketing and consumer behavior", "Start a blog or social media page on a topic you're passionate about"],
    year3: ["Pursue a BBA or a B.Com degree with a marketing specialization", "Learn about digital marketing tools (SEO, Google Ads)", "Intern with the marketing team of a company"],
    year5: ["Graduate and land a role as a Marketing Coordinator or Specialist", "Run your first major marketing campaign", "Analyze campaign data to measure success"],
  },
  "Financial Analysis": {
    year1: ["Complete 12th grade from the Commerce stream with Math", "Master accounting principles and Excel", "Follow the stock market and business news"],
    year3: ["Pursue a B.Com or BBA in Finance degree", "Learn financial modeling and valuation", "Intern at a financial firm or a bank"],
    year5: ["Graduate and prepare for certifications like CFA Level 1", "Get a job as a Junior Financial Analyst", "Assist in preparing financial reports for a company"],
  },
  "Chartered Accountancy": {
    year1: ["Complete 12th grade from the Commerce stream", "Register for the CA Foundation course", "Clear the Foundation exam"],
    year3: ["Clear the CA Intermediate exams (both groups)", "Begin your 3-year articleship training under a practicing CA", "Gain practical experience in audit, tax, and accounting"],
    year5: ["Appear for the CA Final exams", "Complete your articleship", "Qualify as a Chartered Accountant"],
  },
};

const RoadmapMilestone = ({ title, milestones }: { title: string; milestones: string[] }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-0 flex h-full">
      <div className="h-full w-px bg-border"></div>
      <div className="absolute -left-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
        <span className="text-xs font-bold text-primary-foreground">{title.substring(0, 2)}</span>
      </div>
    </div>
    <div className="pb-8">
      <h4 className="font-semibold text-primary">{title}</h4>
      <ul className="mt-2 space-y-2">
        {milestones.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function CareerRoadmap({ stream }: { stream: string }) {
  const data = roadmapData[stream] || roadmapData["Software Engineering"];

  return (
    <div className="w-full">
      <RoadmapMilestone title="Year 1" milestones={data.year1} />
      <RoadmapMilestone title="Year 3" milestones={data.year3} />
      <div className="relative pl-8">
        <div className="absolute left-0 top-0 flex h-full">
          <div className="absolute -left-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-primary-foreground">Y5</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-primary">Year 5</h4>
          <ul className="mt-2 space-y-2">
            {data.year5.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
