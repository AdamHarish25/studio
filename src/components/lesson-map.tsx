'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/lib/course-data';
import { Flame, Landmark, Scale, Milestone, LucideProps, CheckCircle } from 'lucide-react';
import { useUserProgress } from '@/context/user-progress-context';

type LessonMapProps = {
  lessons: Lesson[];
};

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Flame,
  Scale,
  Landmark,
  Milestone,
};


export function LessonMap({ lessons }: LessonMapProps) {
  const { completedLessons } = useUserProgress();
  
  // Find first uncompleted lesson to be the current one
  const currentLesson = lessons.find(l => !completedLessons.includes(l.id)) || lessons[lessons.length - 1];
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    currentLesson
  );

  const getStatus = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) {
      return 'completed';
    }
    if (lessonId === currentLesson.id) {
        return 'current';
    }
    return 'locked';
  }


  return (
    <div className="relative">
      {/* The main connecting line */}
      <div className="absolute left-6 top-6 h-full w-0.5 bg-border -translate-x-1/2" />

      <div className="space-y-8">
        {lessons.map(lesson => {
          const status = getStatus(lesson.id);
          const isSelected = selectedLesson?.id === lesson.id;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const Icon = iconMap[lesson.icon];

          return (
            <div
              key={lesson.id}
              className="relative flex items-center"
              onClick={() => !isLocked && setSelectedLesson(lesson)}
            >
              {/* Vertical line connector - part of the list for z-index */}
              <div
                className={cn(
                  'absolute top-full left-6 -translate-x-1/2 w-0.5 h-8 bg-border',
                   // Hide line on last item
                   lesson.id === lessons[lessons.length - 1].id && 'hidden'
                )}
              />
              
              <div className="z-10 relative">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 transition-all cursor-pointer',
                    isSelected && 'border-primary ring-4 ring-primary/20 scale-110',
                    isLocked ? 'border-muted bg-muted' : 'border-border hover:border-primary',
                    isCompleted && 'border-green-500 bg-green-500/10'
                  )}
                >
                  {Icon && <Icon className={cn('h-6 w-6', isLocked ? 'text-muted-foreground' : isCompleted ? 'text-green-500' : 'text-primary')} />}
                </div>
                 {isCompleted && (
                    <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 bg-background text-green-600 rounded-full" />
                 )}
              </div>

              <div className="ml-8 flex-1">
                 <div
                    className={cn(
                        "font-semibold",
                        isLocked ? "text-muted-foreground" : "text-foreground"
                    )}
                 >
                    LEVEL {lesson.level}
                 </div>
                 <div className="text-lg font-bold">
                    {lesson.title}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedLesson && (
        <Card className="sticky bottom-4 mt-8 w-full shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-bold">{selectedLesson.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedLesson.description}</p>
            </div>
            <Button asChild size="lg" disabled={getStatus(selectedLesson.id) === 'locked'}>
              <Link href={`/lesson/${selectedLesson.slug}`}>
                {getStatus(selectedLesson.id) === 'completed' ? 'Review' : 'Start'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
