import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import roadmaps from '@/data/career-roadmaps.json';

export const seedCareerRoadmaps = async (firestore: any) => {
    if (!firestore) return;

    try {
        const roadmapsRef = collection(firestore, 'careerPaths');
        const snapshot = await getDocs(roadmapsRef);

        if (!snapshot.empty) {
            console.log('Career paths already seeded.');
            return;
        }

        console.log('Seeding career paths...');
        const batch = writeBatch(firestore);

        roadmaps.forEach((map) => {
            const docRef = doc(roadmapsRef, map.id);
            batch.set(docRef, map);
        });

        await batch.commit();
        console.log('Career paths seeded successfully!');
    } catch (error) {
        console.error('Error seeding career paths:', error);
    }
};
