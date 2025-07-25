import { Header } from '@/components/layout/header';
import { CourseCard } from '@/components/course-card';
import { LessonMap } from '@/components/lesson-map';
import { courseData } from '@/lib/course-data';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-3 md:gap-12 md:px-8 lg:grid-cols-4 lg:gap-16">
          <div className="md:col-span-1 lg:col-span-1">
            <CourseCard
              title={courseData.title}
              description={courseData.description}
              lessons={courseData.lessons.length}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <LessonMap lessons={courseData.lessons} />
          </div>
        </div>
      </main>
    </div>
  );
}
