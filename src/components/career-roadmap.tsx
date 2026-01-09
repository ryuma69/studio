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

export default function CareerRoadmap({ stream }: { stream: string }) {
  const firestore = useFirestore();
  const [dbData, setDbData] = useState<DBRouteStep[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Removed local fallback logic

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!firestore || !stream) return;
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
        } else {
          setDbData(null);
        }
      } catch (e) {
        console.error("Failed to fetch roadmap from DB", e);
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
        <p className="text-muted-foreground animate-pulse">Retrieving verified roadmap from database...</p>
      </div>
    );
  }

  if (dbData && dbData.length > 0) {
    return (
      <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-bold text-primary flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Database Path Found</h3>
          <p className="text-xs text-muted-foreground">Showing verified career roadmap from Vidhya Sarathi Database.</p>
        </div>
        {dbData.map((step, idx) => (
          <RoadmapMilestone
            key={idx}
            title={step.year}
            milestones={[step.milestone, step.details]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
      <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-20" />
      <p>No verified roadmap found in database for "{stream}".</p>
    </div>
  );
}
