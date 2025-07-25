import { CourseView } from '@/components/course-view';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <CourseView />
      </main>
    </div>
  );
}
