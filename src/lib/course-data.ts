export type Lesson = {
  id: string;
  level: number;
  title: string;
  slug: string;
  icon: string;
  status: 'locked' | 'current' | 'completed';
  description: string;
};

export type CourseData = {
  title: string;
  description: string;
  lessons: Lesson[];
};

export const courseData: CourseData = {
  title: 'Financial Literacy',
  description:
    'Master the essential concepts of personal finance, from budgeting and saving to understanding debt and investments.',
  lessons: [
    {
      id: 'l1',
      level: 1,
      title: 'Budgeting Basics',
      slug: 'budgeting-basics',
      icon: 'Flame',
      status: 'completed',
      description: "Learn how a simple budget can help you control your money and reach your goals."
    },
    {
      id: 'l2',
      level: 2,
      title: 'Understanding Debt',
      slug: 'understanding-debt',
      icon: 'Scale',
      status: 'current',
      description: "Not all debt is created equal. Learn to distinguish between good and bad debt."
    },
    {
      id: 'l3',
      level: 3,
      title: 'Savings & Investments',
      slug: 'savings-and-investments',
      icon: 'Landmark',
      status: 'locked',
      description: "Discover the power of compound interest and start building your nest egg."
    },
     {
      id: 'l4',
      level: 4,
      title: 'Final Review',
      slug: 'final-review',
      icon: 'Milestone',
      status: 'locked',
      description: "Test your knowledge and see how far you've come on your financial journey."
    },
  ],
};
