
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, PiggyBank, ShoppingCart, Home, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';


// --- Type Definitions ---
type Option = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type BaseStep = {
  title: string;
  text: string;
  explanation?: string;
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

type QuestionStep = BaseStep & {
  type: 'question';
  options: Option[];
};

type InteractiveBalanceStep = BaseStep & {
    type: 'interactive_balance';
    data: { name: string; value: number }[];
    correctAnswer: number;
};


type FinalStep = BaseStep & {
  type: 'final';
};

type Step = IntroStep | SandboxStep | QuestionStep | FinalStep | InteractiveBalanceStep;

// --- Module Data ---
const moduleData = {
    title: "First Salary Budgeting",
    steps: [
        {
            type: 'lesson_intro' as 'lesson_intro',
            title: 'Budgeting Basics',
            text: "Your first salary is exciting! Let's learn how a simple budget can help you control your money and reach your goals.",
            illustration_url: 'https://i.imgur.com/8dbP4S2.png'
        },
        {
            type: 'interactive_sandbox' as 'interactive_sandbox',
            title: 'Allocate Your Budget',
            text: 'You have Rp 5,000,000. Click on the buckets below to allocate your money in chunks of Rp 500,000 and see how it splits.',
            totalBudget: 5000000,
            increment: 500000
        },
        {
            type: 'question' as 'question',
            title: 'Prioritize First',
            text: 'After planning, what is the wisest first allocation?',
            options: [
                { text: 'Plan a vacation with friends.', isCorrect: false, feedback: "While fun, this is a 'want', not a 'need'. A solid financial base comes first!" },
                { text: 'Create a budget plan.', isCorrect: true, feedback: 'Excellent! A budget is a map for your money. It tells your money where to go instead of wondering where it went.' },
                { text: 'Buy the latest smartphone.', isCorrect: false, feedback: "Tempting! But impulsive big purchases can derail your financial goals before you even start." }
            ]
        },
        {
            type: 'interactive_balance' as 'interactive_balance',
            title: 'Find the Balance: The 50/30/20 Rule',
            text: 'The 50/30/20 rule suggests 50% of income for Needs and 30% for Wants. If your take-home pay is Rp 10,000,000, your Needs are Rp 5,000,000 and Wants are Rp 3,000,000. Where should the "balance point" for these two be?',
            data: [
                { name: 'Wants', value: 3000000 },
                { name: 'Needs', value: 5000000 },
            ],
            correctAnswer: 4000000,
            explanation: "The balance point isn't just the middle of the number line; it's the weighted average! With Needs (5M) having more weight than Wants (3M), the balance point is pulled closer to Needs. A budget is about balancing priorities, not just splitting things equally."
        },
        {
            type: 'final' as 'final',
            title: 'Well Done!',
            text: 'You\'ve learned the basics of prioritizing and budgeting. You are now ready to make smarter financial decisions from day one. Keep this momentum going!'
        }
    ]
};

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Main Component ---
export function FinQuest() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);

  const [sandboxState, setSandboxState] = useState({
    remaining: 0,
    needs: 0,
    wants: 0,
    savings: 0,
  });

  const currentStep: Step = moduleData.steps[currentStepIndex];
  const progress = ((currentStepIndex) / (moduleData.steps.length -1)) * 100;

  // Reset states when moving to a new step
  useEffect(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSubmittedAnswer(null);

    if (currentStep.type === 'interactive_sandbox') {
      setSandboxState({
        remaining: currentStep.totalBudget,
        needs: 0,
        wants: 0,
        savings: 0,
      });
    }
    if (currentStep.type === 'interactive_balance') {
      const { data } = currentStep;
      const values = data.map(d => d.value);
      const min = Math.min(...values);
      setSliderValue(min);
    }
  }, [currentStepIndex, currentStep]);


  const handleOptionClick = (option: Option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (currentStepIndex < moduleData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleRestart = () => {
    setCurrentStepIndex(0);
  }

  const handleTryAgain = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSubmittedAnswer(null);
    if (currentStep.type === 'interactive_balance') {
        const { data } = currentStep;
        const values = data.map(d => d.value);
        const min = Math.min(...values);
        setSliderValue(min);
    }
  }
  
  const handleAllocateBudget = (bucket: keyof typeof sandboxState) => {
    if (currentStep.type !== 'interactive_sandbox' || sandboxState.remaining === 0) return;
    
    setSandboxState(prev => ({
      ...prev,
      remaining: prev.remaining - currentStep.increment,
      [bucket]: prev[bucket] + currentStep.increment,
    }));
  };

  const handleSubmitInteractive = () => {
      if (isAnswered) return;
      setIsAnswered(true);
      setSubmittedAnswer(sliderValue);
  };

  const isCorrectInteractive = currentStep.type === 'interactive_balance' && submittedAnswer !== null && submittedAnswer === currentStep.correctAnswer;

  const showContinueButton = useMemo(() => {
    if (currentStep.type === 'lesson_intro') return true;
    if (currentStep.type === 'interactive_sandbox') return sandboxState.remaining === 0;
    if (currentStep.type === 'question') return isAnswered && selectedOption?.isCorrect;
    if (currentStep.type === 'interactive_balance') return isAnswered && isCorrectInteractive;
    return false;
  }, [currentStep.type, isAnswered, selectedOption, sandboxState.remaining, isCorrectInteractive]);

  const showTryAgainButton = (currentStep.type === 'question' && isAnswered && !selectedOption?.isCorrect) || (currentStep.type === 'interactive_balance' && isAnswered && !isCorrectInteractive);

  const getOptionButtonClass = (option: Option) => {
    if (!isAnswered) {
      return "bg-card hover:bg-accent hover:-translate-y-1 text-foreground border-2 border-border hover:border-primary shadow-md hover:shadow-soft";
    }
    if (option === selectedOption) {
      return option.isCorrect
        ? "bg-accent border-2 border-primary text-accent-foreground shadow-soft"
        : "bg-destructive/20 border-2 border-destructive text-destructive-foreground shadow-soft";
    }
    return "bg-card text-muted-foreground border-2 border-border cursor-not-allowed";
  };
  
  const renderContent = () => {
    switch (currentStep.type) {
      case 'lesson_intro':
        return (
            <div className="flex flex-col items-center text-center">
                <Image
                    data-ai-hint="financial planning budget"
                    id="lesson-illustration"
                    src={currentStep.illustration_url}
                    alt="Budgeting illustration"
                    width={600}
                    height={400}
                    className="max-h-[300px] object-contain mb-8 rounded-2xl"
                />
                <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
            </div>
        );

      case 'interactive_sandbox':
        const totalBudget = currentStep.totalBudget;
        const buckets = [
          { id: 'needs' as const, label: 'Needs', icon: Home, color: 'text-blue-500' },
          { id: 'wants' as const, label: 'Wants', icon: ShoppingCart, color: 'text-pink-500' },
          { id: 'savings' as const, label: 'Savings', icon: PiggyBank, color: 'text-green-500' },
        ];
        return (
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="font-extrabold text-2xl sm:text-4xl mb-2 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-6">{currentStep.text}</p>
            
            <div id="money-pool" className="mb-8 p-4 bg-primary/10 rounded-2xl">
              <p className="text-sm font-bold text-primary">Money Pool</p>
              <p className="text-3xl font-extrabold text-primary">{formatCurrency(sandboxState.remaining)}</p>
            </div>
            
            <div id="sandbox-container" className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              {buckets.map((bucket) => {
                const Icon = bucket.icon;
                const allocated = sandboxState[bucket.id];
                const percentage = totalBudget > 0 ? (allocated / totalBudget) * 100 : 0;

                return (
                  <div
                    key={bucket.id}
                    onClick={() => handleAllocateBudget(bucket.id)}
                    className={cn(
                      "budget-bucket p-4 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors hover:border-primary hover:bg-accent",
                      sandboxState.remaining === 0 && "cursor-not-allowed opacity-70"
                    )}
                  >
                    <Icon className={cn("w-8 h-8", bucket.color)} />
                    <h3 className="font-bold text-foreground">{bucket.label}</h3>
                    <p className="font-extrabold text-xl text-foreground">{formatCurrency(allocated)}</p>
                    <p className="text-sm font-bold text-muted-foreground">{percentage.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'interactive_balance': {
          const { data, correctAnswer } = currentStep;
          const values = data.map(d => d.value);
          const min = Math.min(...values);
          const max = Math.max(...values);

          const chartData = data.map(item => ({
              ...item,
              label: `${item.name}\n(${formatCurrency(item.value)})`
          }));
          
          const EmptyTooltip = () => null;


          return (
              <div className="flex flex-col items-center text-center w-full">
                  <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
                  <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
                  
                   <div className="flex justify-center mb-4">
                      <div className="p-2 bg-card rounded-full shadow-md border">
                        <Scale className="h-6 w-6 text-foreground"/>
                      </div>
                   </div>

                  <div className="w-full h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} />
                              <YAxis hide={true} domain={[0, max * 1.2]}/>
                              <Tooltip content={<EmptyTooltip />} />
                              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40}>
                                  <LabelList dataKey="value" position="top" formatter={(value: number) => formatCurrency(value)} />
                              </Bar>
                              {isAnswered && (
                                <ReferenceLine 
                                  x={isCorrectInteractive ? undefined : chartData.find(d => d.value === submittedAnswer)?.label}
                                  stroke={isCorrectInteractive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                                  strokeWidth={2}
                                />
                              )}
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                   <div className="relative w-full max-w-sm mt-8">
                      <Slider
                          value={[sliderValue]}
                          onValueChange={(value) => setSliderValue(value[0])}
                          min={min}
                          max={max}
                          step={(max - min) / 100}
                          disabled={isAnswered}
                          className="w-full"
                      />
                   </div>
                   <p className="mt-4 font-bold text-lg">{formatCurrency(sliderValue)}</p>

                   {!isAnswered && (
                       <Button onClick={handleSubmitInteractive} className="mt-4">Check Answer</Button>
                   )}
              </div>
          );
      }
        
      case 'question':
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
            <div className="w-full max-w-md space-y-4 mb-8">
              {currentStep.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full h-auto justify-start p-4 text-left font-bold text-base sm:text-lg rounded-2xl transition-all duration-300 ease-in-out transform",
                    getOptionButtonClass(option)
                  )}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'final':
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
          </div>
        );
    }
  };

  const renderFeedback = () => {
    if (!isAnswered) return null;

    let isCorrect = false;
    let feedbackText = '';

    if (currentStep.type === 'question' && selectedOption) {
        isCorrect = selectedOption.isCorrect;
        feedbackText = selectedOption.feedback;
    } else if (currentStep.type === 'interactive_balance') {
        isCorrect = isCorrectInteractive;
        feedbackText = isCorrect ? "That's right! You've found the perfect balance." : currentStep.explanation || "Not quite. Let's see the explanation.";
    } else {
        return null;
    }

    return (
        <div className={cn(
            "w-full max-w-md p-4 mt-4 rounded-2xl flex items-start space-x-4 animate-in fade-in duration-500",
            isCorrect ? 'bg-accent' : 'bg-destructive/20'
        )}>
            {isCorrect ?
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" /> :
                <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            }
            <p className={cn(
                "font-bold text-left",
                isCorrect ? 'text-accent-foreground' : 'text-destructive'
            )}>{feedbackText}</p>
        </div>
    );
};


  return (
    <Card className="w-full max-w-3xl shadow-soft font-body">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="font-extrabold text-2xl sm:text-3xl text-foreground">{moduleData.title}</CardTitle>
        </div>
        <Progress value={progress} className="w-full h-3 bg-accent" />
      </CardHeader>
      <CardContent className="px-6 py-8 sm:p-10 flex flex-col items-center justify-between min-h-[500px]">
        
        <div className="w-full flex-grow flex flex-col items-center justify-center">
            {renderContent()}

            {isAnswered && renderFeedback()}
        </div>

        <div className="mt-8 pt-4">
          {showContinueButton && (
            <Button 
              onClick={handleContinue} 
              size="lg"
              className="font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform bg-primary hover:bg-accent-hover"
            >
              {currentStep.type === 'lesson_intro' ? 'Start Learning' : 'Continue'}
            </Button>
          )}
          {showTryAgainButton && (
            <Button 
              onClick={handleTryAgain} 
              size="lg"
              variant="outline"
              className="font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform hover:bg-accent-hover"
            >
              Try Again
            </Button>
          )}
           {currentStep.type === 'final' && (
            <Button 
              onClick={handleRestart} 
              size="lg"
              className="font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform bg-primary hover:bg-accent-hover"
            >
              Start Over
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
