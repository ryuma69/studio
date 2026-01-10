import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import { useFirestore } from "@/firebase/provider";
import { collection, query, getDocs } from "firebase/firestore";

type DBRouteStep = {
  year: string;
  milestone: string;
  details: string;
};

// Removed hardcoded roadmapData as per request to use DB only.
export const allCareerStreams = []; // Or fetch dynamically if needed elsewhere

const RoadmapMilestone = ({ title, milestones, details }: { title: string; milestones: string[]; details?: string }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-0 flex h-full">
      <div className="h-full w-px bg-border"></div>
      <div className="absolute -left-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-background shadow-sm">
        {title.includes("1") || title.includes("11") ? <BookOpen className="h-3 w-3 text-primary-foreground" /> :
          title.includes("3") || title.includes("Entrance") ? <Loader2 className="h-3 w-3 text-primary-foreground" /> :
            <Briefcase className="h-3 w-3 text-primary-foreground" />}
      </div>
    </div>
    <div className="pb-8 group">
      <h4 className="font-bold text-primary text-lg flex items-center gap-2">{title}</h4>
      {details && <p className="text-xs text-muted-foreground mb-2 italic">{details}</p>}
      <ul className="mt-2 space-y-3">
        {milestones.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-foreground/80 bg-muted/30 p-2 rounded hover:bg-muted/50 transition-colors">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Helper to generate generic roadmap if DB fails
const getGenericRoadmap = (streamName: string): DBRouteStep[] => [
  {
    year: "Class 11 & 12",
    milestone: "Foundation Building",
    details: `Focus on core subjects relevant to ${streamName}. Build strong conceptual clarity.`
  },
  {
    year: "Entrance Phase",
    milestone: "Competitive Exams & Applications",
    details: "Prepare for relevant entrance exams or build a portfolio for college admissions."
  },
  {
    year: "Undergraduate",
    milestone: "Bachelor's Degree (3-4 Years)",
    details: `Pursue a degree in ${streamName} or related fields. Engage in projects and workshops.`
  },
  {
    year: "Skill Acquisition",
    milestone: "Internships & Certifications",
    details: "Gain practical experience through internships. Get certified in specialized tools."
  },
  {
    year: "Professional Start",
    milestone: "Entry Level Job / Higher Studies",
    details: "Start your career as a junior professional or pursue a Master's degree for specialization."
  }
];

export default function CareerRoadmap({ stream }: { stream: string }) {
  const firestore = useFirestore();
  const [dbData, setDbData] = useState<DBRouteStep[] | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!stream) return;

      // If no firestore, fallback immediately
      if (!firestore) {
        setDbData(getGenericRoadmap(stream));
        setIsVerified(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const roadmapsRef = collection(firestore, 'careerPaths');
        const q = query(roadmapsRef);
        // Fetch all and fuzzy match client-side
        const snapshot = await getDocs(q);

        const match = snapshot.docs.find(doc => {
          const data = doc.data();
          return data.title?.toLowerCase().includes(stream.toLowerCase()) ||
            data.stream?.toLowerCase().includes(stream.toLowerCase()) ||
            data.id?.toLowerCase().includes(stream.toLowerCase()) ||
            stream.toLowerCase().includes(data.title?.toLowerCase());
        });

        if (match) {
          setDbData(match.data().roadmap);
          setIsVerified(true);
        } else {
          setDbData(getGenericRoadmap(stream));
          setIsVerified(false);
        }
      } catch (e) {
        console.error("Failed to fetch roadmap from DB", e);
        setDbData(getGenericRoadmap(stream));
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [firestore, stream]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground animate-pulse">Charting your path...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className={`mb-6 p-4 rounded-lg border ${isVerified ? 'bg-primary/5 border-primary/10' : 'bg-muted/30 border-muted'}`}>
        <h3 className={`font-bold flex items-center gap-2 ${isVerified ? 'text-primary' : 'text-muted-foreground'}`}>
          <GraduationCap className="h-5 w-5" />
          {isVerified ? 'Verified Career Path' : 'Suggested Roadmap'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isVerified
            ? 'Verified by Vidhya Sarathi experts.'
            : 'AI-suggested general guidelines for this career path.'}
        </p>
      </div>

      {dbData && dbData.map((step, idx) => (
        <RoadmapMilestone
          key={idx}
          title={step.year}
          milestones={[step.milestone, step.details]}
        />
      ))}
    </div>
  );
}
