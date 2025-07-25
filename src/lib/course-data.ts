




// --- Type Definitions ---
type Option = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type Scenario = {
  name: string;
  icon: string;
  wiseChoice: 'Good Debt' | 'Bad Debt';
  feedback: {
    correct: string;
    incorrect: string;
  }
};

type BaseStep = {
  title: string;
  text: string;
  exp: number;
};

type IntroStep = BaseStep & {
  type: 'lesson_intro';
  illustration_url: string;
};

type SandboxStep = BaseStep & {
  type: 'interactive_sandbox';
  totalBudget: number;
  increment: number;
};

type AllocationFeedbackStep = BaseStep & {
    type: 'allocation_feedback';
    recommendedAllocation: {
        needs: number;
        wants: number;
        savings: number;
    };
};

type InteractiveSortingStep = BaseStep & {
    type: 'interactive_sorting';
    scenarios: Scenario[];
}

type QuestionStep = BaseStep & {
  type: 'question';
  options: Option[];
  explanation?: string;
};

type InteractiveBalanceStep = BaseStep & {
    type: 'interactive_balance';
    data: { name: string; value: number }[];
    correctAnswer: number;
    explanation?: string;
};

type InteractiveRiskReturnStep = BaseStep & {
    type: 'interactive_risk_return';
    totalAmount: number;
    years: number;
    options: {
        savings: { name: string; annualReturn: number };
        investments: { name: string; annualReturn: number };
    };
};

type RiskReturnFeedbackStep = BaseStep & {
    type: 'risk_return_feedback';
    feedback: {
        highRisk: { title: string; text: string };
        lowRisk: { title: string; text: string };
        balanced: { title: string; text: string };
    }
}


type FinalScenarioEvent = {
    title: string;
    text: string;
    choices: {
        text: string;
        impact: {
            savings?: number;
            debt?: number;
            investments?: number;
        };
        feedback: string;
        isWiseChoice: boolean;
        exp: number;
    }[];
};

type InteractiveScenarioStep = BaseStep & {
    type: 'interactive_scenario';
    initialState: {
        savings: number;
        debt: number;
        investments: number;
    };
    events: FinalScenarioEvent[];
};


type FinalStep = BaseStep & {
  type: 'final';
};

export type Step = IntroStep | SandboxStep | QuestionStep | FinalStep | InteractiveBalanceStep | AllocationFeedbackStep | InteractiveSortingStep | InteractiveRiskReturnStep | InteractiveScenarioStep | RiskReturnFeedbackStep;

export type LessonData = {
    title: string;
    steps: Step[];
    id: string; // Add lesson ID here
}

export type AllCourseData = {
    [key: string]: LessonData;
}


// --- Course Data ---

const budgetingBasics: LessonData = {
    id: 'l1',
    title: "First Salary Budgeting",
    steps: [
        {
            type: 'lesson_intro',
            title: 'Budgeting Basics',
            text: "Your first salary is exciting! Let's learn how a simple budget can help you control your money and reach your goals.",
            illustration_url: 'https://i.imgur.com/3nL3gd7.png',
            exp: 10,
        },
        {
            type: 'interactive_sandbox',
            title: 'Allocate Your Budget',
            text: 'You have Rp 5,000,000. Click on the buckets below to allocate your money in chunks of Rp 500,000 and see how it splits.',
            totalBudget: 5000000,
            increment: 500000,
            exp: 50,
        },
        {
            type: 'allocation_feedback',
            title: 'Your Budget Review',
            text: "Let's see how your allocation stacks up against a common guideline: 50% for Needs, 30% for Savings, and 20% for Wants. This isn't a strict rule, but a great starting point!",
            recommendedAllocation: {
                needs: 50,
                wants: 20,
                savings: 30,
            },
            exp: 10,
        },
        {
            type: 'question',
            title: 'Prioritize First',
            text: 'After planning, what is the wisest first allocation?',
            options: [
                { text: 'Plan a vacation with friends.', isCorrect: false, feedback: "While fun, this is a 'want', not a 'need'. A solid financial base comes first!" },
                { text: 'Create a budget plan.', isCorrect: true, feedback: 'Excellent! A budget is a map for your money. It tells your money where to go instead of wondering where it went.' },
                { text: 'Buy the latest smartphone.', isCorrect: false, feedback: "Tempting! But impulsive big purchases can derail your financial goals before you even start." }
            ],
            exp: 25,
        },
        {
            type: 'interactive_balance',
            title: 'Find the Balance: The 50/30/20 Rule',
            text: 'The 50/30/20 rule suggests 50% of income for Needs and 30% for Wants. If your take-home pay is Rp 10,000,000, your Needs are Rp 5,000,000 and Wants are Rp 3,000,000. Where should the "balance point" for these two be?',
            data: [
                { name: 'Wants', value: 3000000 },
                { name: 'Needs', value: 5000000 },
            ],
            correctAnswer: 4000000,
            explanation: "The balance point isn't just the middle of the number line; it's the weighted average! With Needs (5M) having more weight than Wants (3M), the balance point is pulled closer to Needs. A budget is about balancing priorities, not just splitting things equally.",
            exp: 50,
        },
        {
            type: 'final',
            title: 'Well Done!',
            text: 'You\'ve learned the basics of prioritizing and budgeting. You are now ready to make smarter financial decisions from day one. Keep this momentum going!',
            exp: 0,
        }
    ]
};

const understandingDebt: LessonData = {
    id: 'l2',
    title: "Understanding Debt",
    steps: [
        {
            type: 'lesson_intro',
            title: 'What is Debt?',
            text: "Debt is when you borrow money that you have to pay back, usually with an extra charge called 'interest'. Let's learn how to make debt work for you, not against you.",
            illustration_url: 'https://i.imgur.com/2U5VqX6.png',
            exp: 10
        },
        {
            type: 'interactive_sorting',
            title: 'Good Debt vs. Bad Debt',
            text: "A loan is presented to you. Based on its purpose, decide if it's generally considered 'Good Debt' (helps increase your net worth or future income) or 'Bad Debt' (finances things that lose value or are consumed).",
            scenarios: [
                { name: "A student loan for a university degree.", icon: 'GraduationCap', wiseChoice: 'Good Debt', feedback: { correct: "Great choice! Education is an investment in yourself that can increase your future earnings.", incorrect: "Actually, this is usually good debt because it can help you earn more money in the future." } },
                { name: "A loan to start a small online business.", icon: 'Briefcase', wiseChoice: 'Good Debt', feedback: { correct: "Correct! This loan could help you build a profitable business and increase your net worth.", incorrect: "This is typically considered good debt, as it's an investment with the potential for growth." } },
                { name: "A loan to buy the newest, most expensive smartphone.", icon: 'ShoppingCart', wiseChoice: 'Bad Debt', feedback: { correct: "Exactly! The phone's value drops quickly, making this a classic example of bad debt.", incorrect: "Think again. This is usually bad debt because the phone loses value the moment you buy it." } },
                { name: "A big loan for a wedding party.", icon: 'Handshake', wiseChoice: 'Bad Debt', feedback: { correct: "You got it. While a wedding is a happy event, a large loan for it is consumption, not an investment.", incorrect: "This is generally considered bad debt because it's for a one-time event and doesn't generate income." } },
                { name: "A loan for buying the latest toys.", icon: 'ToyBrick', wiseChoice: 'Bad Debt', feedback: { correct: "That's right! Toys are 'wants' that don't increase in value, so borrowing for them is bad debt.", incorrect: "This is a form of bad debt. It's better to save up for toys instead of borrowing." } },
            ],
            exp: 50
        },
        {
            type: 'question',
            title: 'The Cost of Debt',
            text: 'You take a loan of Rp 1,000,000 with a 10% simple annual interest rate. If you pay it back after one year, how much will you pay in total?',
            options: [
                { text: 'Rp 1,000,000', isCorrect: false, feedback: "Not quite. You must also pay the interest, which is the cost of borrowing the money." },
                { text: 'Rp 1,010,000', isCorrect: false, feedback: "Check your calculation. 10% of 1,000,000 is more than 10,000." },
                { text: 'Rp 1,100,000', isCorrect: true, feedback: 'Exactly! The total payment is the original loan (Rp 1,000,000) plus the interest (Rp 100,000).' }
            ],
            exp: 25,
        },
        {
            type: 'final',
            title: 'Debt Mastered!',
            text: 'Great job! You now understand the critical difference between using debt as a tool for growth and letting it become a burden.',
            exp: 0
        }
    ]
};

const savingsAndInvestments: LessonData = {
    id: 'l3',
    title: "Savings & Investments",
    steps: [
        {
            type: 'lesson_intro',
            title: 'Grow Your Money',
            text: "Putting money aside is smart, but making it grow is even smarter. Let's explore the difference between saving and investing.",
            illustration_url: 'https://i.imgur.com/G5VwB8A.png',
            exp: 10
        },
        {
            type: 'interactive_risk_return',
            title: 'Risk & Return Simulator',
            text: "You have Rp 10,000,000 to put aside for 5 years. Allocate it between a Safe Savings Account and Stock Investments to see the potential outcome.",
            totalAmount: 10000000,
            years: 5,
            options: {
                savings: { name: "Savings Account", annualReturn: 0.03 }, // 3% return
                investments: { name: "Stock Market", annualReturn: 0.12 } // 12% potential return
            },
            exp: 50,
        },
        {
            type: 'risk_return_feedback',
            title: 'Your Strategy Analysis',
            text: "Based on your allocation, here's an analysis of your investment strategy.",
            exp: 10,
            feedback: {
                highRisk: {
                    title: "Aggressive Growth",
                    text: "You're aiming for high growth by taking on more risk! This could lead to big rewards, but be prepared for potential volatility. It's a strategy that suits those with a long time horizon."
                },
                lowRisk: {
                    title: "Capital Preservation",
                    text: "You're playing it safe, prioritizing protecting your money over high returns. This is a great strategy for short-term goals or for those who are uncomfortable with market swings."
                },
                balanced: {
                    title: "Balanced Approach",
                    text: "You've chosen a middle path, balancing the safety of savings with the growth potential of investments. This is a common and sensible strategy for steady, long-term growth."
                }
            }
        },
        {
            type: 'question',
            title: 'The Magic of Compounding',
            text: 'Compounding is when your interest starts earning its own interest. Which of these options benefits the MOST from compounding?',
            options: [
                { text: 'Saving Rp 1,000,000 for one year.', isCorrect: false, feedback: "Compounding needs time. One year is just the beginning." },
                { text: 'Investing Rp 100,000 per month for 30 years.', isCorrect: true, feedback: 'Correct! The longer your money is invested, the more powerful the effect of compounding becomes.' },
                { text: 'Keeping Rp 5,000,000 in cash under your bed.', isCorrect: false, feedback: "Cash that isn't invested or saved in an interest-bearing account doesn't compound at all." }
            ],
            exp: 25,
        },
        {
            type: 'final',
            title: 'Investor in the Making!',
            text: "You've grasped the core concepts of making your money work for you. You're on the right path to building wealth.",
            exp: 0
        }
    ]
};

const finalReview: LessonData = {
    id: 'l4',
    title: "Final Review",
    steps: [
        {
            type: 'lesson_intro',
            title: 'The Final Challenge',
            text: "It's time to put everything you've learned to the test. You will manage your finances through several life events. Your goal is to finish with a positive net worth. Good luck!",
            illustration_url: 'https://i.imgur.com/pYqZzF1.png',
            exp: 10,
        },
        {
            type: 'interactive_scenario',
            title: 'A Year in Your Financial Life',
            text: "Make decisions to navigate the year. Each choice will impact your budget, debt, and investments.",
            exp: 0, // Exp is awarded per choice
            initialState: {
                savings: 2000000,
                debt: 10000000,
                investments: 0
            },
            events: [
                {
                    title: "Unexpected Expense",
                    text: "Your laptop broke! A new one costs Rp 7,000,000. How do you pay for it?",
                    choices: [
                        { text: "Pay with savings.", impact: { savings: -7000000 }, feedback: "Good choice! Using your emergency savings for an emergency means you avoid taking on new, high-interest debt. It's a tough hit to your savings, but financially sound.", isWiseChoice: true, exp: 50 },
                        { text: "Take a new high-interest loan.", impact: { debt: 7500000 }, feedback: "This is a quick fix, but it's costly. The high interest means you'll pay back much more than the laptop is worth. This is 'bad debt' that can trap you in a cycle of payments.", isWiseChoice: false, exp: 10 }
                    ]
                },
                {
                    title: "Investment Opportunity",
                    text: "A friend offers you a chance to invest in their startup. It requires Rp 5,000,000.",
                    choices: [
                        { text: "Invest from savings.", impact: { savings: -5000000, investments: 5000000 }, feedback: "This is a classic risk-vs-reward scenario. Investing in a startup is risky, but the potential for a high return is there. Using savings shows you're willing to take a calculated risk for future growth.", isWiseChoice: true, exp: 50 },
                        { text: "Decline the opportunity.", impact: {}, feedback: "This is the safer option. You protect your savings and avoid a risky venture. While you miss out on potential gains, you also avoid potential losses. There's nothing wrong with being cautious!", isWiseChoice: true, exp: 25 }
                    ]
                }
            ]
        },
        {
            type: 'final',
            title: 'Challenge Complete!',
            text: "Congratulations on completing your financial literacy journey! You now have the fundamental knowledge to build a secure financial future.",
            exp: 0,
        }
    ]
};

export const allCourseData: AllCourseData = {
    'budgeting-basics': budgetingBasics,
    'understanding-debt': understandingDebt,
    'savings-and-investments': savingsAndInvestments,
    'final-review': finalReview,
}

// --- LESSON MAP DATA (separate from lesson content) ---
export type Lesson = {
  id: string;
  level: number;
  title: string;
  slug: string;
  icon: string;
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
      description: "Learn how a simple budget can help you control your money and reach your goals."
    },
    {
      id: 'l2',
      level: 2,
      title: 'Understanding Debt',
      slug: 'understanding-debt',
      icon: 'Scale',
      description: "Not all debt is created equal. Learn to distinguish between good and bad debt."
    },
    {
      id: 'l3',
      level: 3,
      title: 'Savings & Investments',
      slug: 'savings-and-investments',
      icon: 'Landmark',
      description: "Discover the power of compound interest and start building your nest egg."
    },
     {
      id: 'l4',
      level: 4,
      title: 'Final Review',
      slug: 'final-review',
      icon: 'Milestone',
      description: "Test your knowledge and see how far you've come on your financial journey."
    },
  ],
};
