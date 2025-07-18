
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

type Option = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type Step = {
  type: 'intro' | 'question' | 'final';
  title: string;
  text: string;
  options?: Option[];
};

const moduleData = {
  title: "First Salary Budgeting",
  steps: [
    {
      type: 'intro' as 'intro',
      title: "Your First Paycheck!",
      text: "Congratulations! You've just received your first salary of Rp 5,000,000. What's the very first, most important thing to do?",
    },
    {
      type: 'question' as 'question',
      title: "Prioritize First",
      text: "Before you spend anything, what is the wisest first allocation?",
      options: [
        { text: 'Plan a vacation with friends.', isCorrect: false, feedback: "While fun, this is a 'want', not a 'need'. A solid financial base comes first!" },
        { text: 'Create a budget plan.', isCorrect: true, feedback: 'Excellent! A budget is a map for your money. It tells your money where to go instead of wondering where it went.' },
        { text: 'Buy the latest smartphone.', isCorrect: false, feedback: "Tempting! But impulsive big purchases can derail your financial goals before you even start." },
      ],
    },
    {
      type: 'question' as 'question',
      title: "The 50/30/20 Rule",
      text: "A popular budgeting method is the 50/30/20 rule. Based on this, what category should get the largest portion (50%) of your income?",
      options: [
        { text: 'Wants (hobbies, dining out, gadgets)', isCorrect: false, feedback: 'This is the 30% category. Overspending on wants is a common trap!' },
        { text: 'Savings & Investments', isCorrect: false, feedback: 'This is the 20% category. It\'s crucial for your future, but you must cover your essential living costs first.' },
        { text: 'Needs (rent, groceries, utilities)', isCorrect: true, feedback: 'Exactly! 50% should be allocated to essential living expenses. Covering your needs is the foundation of a stable budget.' },
      ],
    },
    {
      type: 'final' as 'final',
      title: "Well Done!",
      text: "You've learned the basics of prioritizing and budgeting. You are now ready to make smarter financial decisions from day one. Keep this momentum going!",
    },
  ],
};

export function FinQuest() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentStep: Step = moduleData.steps[currentStepIndex];
  const progress = ((currentStepIndex) / (moduleData.steps.length -1)) * 100;

  const handleOptionClick = (option: Option) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (currentStepIndex < moduleData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    }
  };
  
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsAnswered(false);
    setSelectedOption(null);
  }

  const handleTryAgain = () => {
    setIsAnswered(false);
    setSelectedOption(null);
  }

  const showContinueButton = (currentStep.type === 'intro') || (isAnswered && selectedOption?.isCorrect);
  const showTryAgainButton = isAnswered && !selectedOption?.isCorrect;


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

  return (
    <Card className="w-full max-w-2xl shadow-soft font-body">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="font-extrabold text-2xl sm:text-3xl text-foreground">{moduleData.title}</CardTitle>
        </div>
        <Progress value={progress} className="w-full h-3 bg-accent" />
      </CardHeader>
      <CardContent className="px-6 py-8 sm:p-10 flex flex-col items-center text-center min-h-[400px]">
        <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
        
        {currentStep.type === 'question' && currentStep.options && (
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
        )}

        {isAnswered && selectedOption && (
          <div className={cn(
            "w-full max-w-md p-4 rounded-2xl flex items-start space-x-4 animate-in fade-in duration-500",
            selectedOption.isCorrect ? 'bg-accent' : 'bg-destructive/20'
          )}>
            {selectedOption.isCorrect ? 
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" /> : 
              <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            }
            <p className={cn(
              "font-bold text-left",
              selectedOption.isCorrect ? 'text-accent-foreground' : 'text-destructive'
            )}>{selectedOption.feedback}</p>
          </div>
        )}

        <div className="mt-auto pt-8">
          {showContinueButton && (
            <Button 
              onClick={handleContinue} 
              size="lg"
              className="font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform bg-primary hover:bg-accent-hover"
            >
              Continue
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
