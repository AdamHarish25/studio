'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/lib/course-data';
import { Flame, Landmark, Scale, Milestone, LucideProps } from 'lucide-react';

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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    lessons.find(l => l.status === 'current') || lessons[0]
  );

  return (
    <div className="relative">
      {/* The main connecting line */}
      <div className="absolute left-6 top-6 h-full w-0.5 bg-border -translate-x-1/2" />

      <div className="space-y-8">
        {lessons.map(lesson => {
          const isSelected = selectedLesson?.id === lesson.id;
          const isLocked = lesson.status === 'locked';
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
              
              <div className="z-10">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 transition-all cursor-pointer',
                    isSelected && 'border-primary ring-4 ring-primary/20 scale-110',
                    isLocked ? 'border-muted bg-muted' : 'border-border hover:border-primary'
                  )}
                >
                  {Icon && <Icon className={cn('h-6 w-6', isLocked ? 'text-muted-foreground' : 'text-primary')} />}
                </div>
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
            <Button asChild size="lg">
              <Link href={`/lesson/${selectedLesson.slug}`}>Start</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
