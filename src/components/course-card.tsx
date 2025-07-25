import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, BarChart2 } from 'lucide-react';
import { allCourseData } from '@/lib/course-data';

type CourseCardProps = {
  title: string;
  description: string;
  lessons: number;
};

// Calculate total exercises once
const totalExercises = Object.values(allCourseData).reduce((total, lesson) => {
    return total + lesson.steps.filter(step => 
        step.type === 'question' || 
        step.type.startsWith('interactive_')
    ).length;
}, 0);


export function CourseCard({ title, description, lessons }: CourseCardProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader className="p-4">
        <div className="aspect-video overflow-hidden rounded-lg border">
          <Image
            src="https://placehold.co/600x400.png"
            data-ai-hint="statistics finance"
            alt="Everyday Statistics"
            width={600}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BookOpen className="mr-1.5 h-4 w-4" />
            <span>{lessons} Lessons</span>
          </div>
          <div className="flex items-center">
            <BarChart2 className="mr-1.5 h-4 w-4" />
            <span>{totalExercises} Exercises</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
