import { CheckCircle2 } from "lucide-react";

type RoadmapData = {
  [key: string]: {
    year1: string[];
    year5: string[];
    year10: string[];
  };
};

const roadmapData: RoadmapData = {
  "Software Engineering": {
    year1: ["Land a Junior Developer role", "Master a core programming language (e.g., JavaScript, Python)", "Contribute to a production codebase"],
    year5: ["Achieve a Senior Developer position", "Lead a small project or feature", "Mentor junior developers"],
    year10: ["Become a Principal Engineer or Architect", "Design and own major systems", "Influence technical strategy"],
  },
  "Data Science": {
    year1: ["Secure a Junior Data Scientist/Analyst role", "Master Python/R for data analysis", "Build and deploy your first predictive model"],
    year5: ["Become a Senior Data Scientist", "Specialize in an area like NLP or Computer Vision", "Lead data-driven projects with business impact"],
    year10: ["Become a Lead/Principal Data Scientist or Head of Data", "Drive AI strategy for the company", "Publish research or speak at conferences"],
  },
  "UX/UI Design": {
    year1: ["Get a Junior UX/UI Designer position", "Build a strong portfolio with 3-5 projects", "Master design tools like Figma or Sketch"],
    year5: ["Transition to a Senior Designer role", "Lead the design of a significant product feature", "Conduct and present user research findings"],
    year10: ["Become a Design Lead, Manager, or Principal Designer", "Define the design vision for a product line", "Mentor and grow a design team"],
  },
  "Graphic Design": {
    year1: ["Work as a Junior Graphic Designer", "Develop a diverse portfolio (branding, web, print)", "Become proficient in Adobe Creative Suite"],
    year5: ["Become a Senior Graphic Designer or Art Director", "Manage branding for key clients or products", "Win a design award or get featured"],
    year10: ["Creative Director or Head of Design", "Lead a creative agency or in-house team", "Shape the visual identity of major brands"],
  },
  "Marketing": {
    year1: ["Start as a Marketing Coordinator or Specialist", "Learn SEO, SEM, and content marketing basics", "Run your first successful campaign"],
    year5: ["Become a Marketing Manager", "Develop and execute a full marketing strategy", "Manage a budget and a small team"],
    year10: ["Director of Marketing, VP, or CMO", "Drive the overall growth strategy of the company", "Become a thought leader in the industry"],
  },
  "Financial Analysis": {
    year1: ["Join as a Junior Financial Analyst", "Master Excel and financial modeling", "Assist in quarterly earnings reports"],
    year5: ["Become a Senior Financial Analyst", "Manage budgeting and forecasting for a business unit", "Earn a certification like CFA"],
    year10: ["Finance Manager or Director", "Provide strategic financial guidance to leadership", "Oversee major investment decisions"],
  },
  "Systems Administration": {
    year1: ["Entry-level IT Support or SysAdmin role", "Earn certifications (e.g., CompTIA A+, Network+)", "Manage user accounts and maintain servers"],
    year5: ["Become a Senior Systems or Cloud Engineer", "Automate infrastructure with scripts", "Manage cloud resources (AWS, Azure, GCP)"],
    year10: ["IT Architect or Manager", "Design and implement entire IT infrastructures", "Ensure security and compliance across the organization"],
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
      <RoadmapMilestone title="Year 5" milestones={data.year5} />
      {/* Last item should not have a bottom border */}
      <div className="relative pl-8">
        <div className="absolute left-0 top-0 flex h-full">
          <div className="absolute -left-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-primary-foreground">Y10</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-primary">Year 10</h4>
          <ul className="mt-2 space-y-2">
            {data.year10.map((item, index) => (
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
