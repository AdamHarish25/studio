import { FinQuest } from '@/components/fin-quest';
import { allCourseData } from '@/lib/course-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';


export default function LessonPage({ params }: { params: { slug: string } }) {
  const lessonData = allCourseData[params.slug];

  if (!lessonData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <Header />
       <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-4xl mb-4">
                 <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Course Map
                    </Link>
                </Button>
            </div>
            <FinQuest lessonData={lessonData} lessonId={lessonData.id} />
       </main>
    </div>
  );
}
