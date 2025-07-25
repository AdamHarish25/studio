
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, PiggyBank, ShoppingCart, Home, Scale, Award, ThumbsUp, ThumbsDown, GraduationCap, Briefcase, Handshake, ToyBrick } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { useUserProgress } from '@/context/user-progress-context';
import type { LessonData, Step } from '@/lib/course-data';

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const iconMap = {
    'GraduationCap': GraduationCap,
    'Briefcase': Briefcase,
    'ShoppingCart': ShoppingCart,
    'Handshake': Handshake,
    'ToyBrick': ToyBrick
}

// --- Main Component ---
export function FinQuest({ lessonData, lessonId }: { lessonData: LessonData, lessonId: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [sortingChoice, setSortingChoice] = useState<'Good Debt' | 'Bad Debt' | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);


  const { addExp, completeLesson } = useUserProgress();
  const [sessionExp, setSessionExp] = useState(0);

  const [sandboxState, setSandboxState] = useState({
    remaining: 0,
    needs: 0,
    wants: 0,
    savings: 0,
  });

  const currentStep: Step = lessonData.steps[currentStepIndex];
  const progress = ((currentStepIndex) / (lessonData.steps.length -1)) * 100;

  // Reset states when moving to a new step
  useEffect(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSubmittedAnswer(null);
    setSortingChoice(null);

    const step = lessonData.steps[currentStepIndex];

    if (step.type === 'interactive_sandbox') {
      setSandboxState({
        remaining: step.totalBudget,
        needs: 0,
        wants: 0,
        savings: 0,
      });
    } else if (step.type === 'interactive_balance') {
      const { data } = step;
      const values = data.map(d => d.value);
      setSliderValue(Math.min(...values));
    } else if (step.type === 'interactive_sorting') {
        // Randomize scenario on step load
        setCurrentScenarioIndex(Math.floor(Math.random() * step.scenarios.length));
    } else if (step.type === 'final') {
        completeLesson(lessonId);
    }
  }, [currentStepIndex, lessonData.steps, completeLesson, lessonId]);


  const handleOptionClick = (option: any) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
    if(option.isCorrect) {
        addExp(currentStep.exp || 0);
        setSessionExp(prev => prev + (currentStep.exp || 0));
    }
  };

  const handleContinue = () => {
    if (['lesson_intro', 'allocation_feedback', 'interactive_sandbox'].includes(currentStep.type)) {
        addExp(currentStep.exp || 0);
        setSessionExp(prev => prev + (currentStep.exp || 0));
    }

    if (currentStepIndex < lessonData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSessionExp(0);
  }

  const handleTryAgain = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSubmittedAnswer(null);
    setSortingChoice(null);

    const step = lessonData.steps[currentStepIndex];
    if (step.type === 'interactive_balance') {
        const { data } = step;
        const values = data.map(d => d.value);
        setSliderValue(Math.min(...values));
    } else if (step.type === 'interactive_sorting') {
        // Optional: pick a new scenario on try again
        const newIndex = (currentScenarioIndex + 1) % step.scenarios.length;
        setCurrentScenarioIndex(newIndex);
    }
  }
  
  const handleAllocateBudget = (bucket: keyof Omit<typeof sandboxState, 'remaining'>) => {
    const sandboxStep = lessonData.steps.find(s => s.type === 'interactive_sandbox');
    if (sandboxStep?.type !== 'interactive_sandbox' || sandboxState.remaining === 0) return;
    
    setSandboxState(prev => ({
      ...prev,
      remaining: prev.remaining - sandboxStep.increment,
      [bucket]: prev[bucket] + sandboxStep.increment,
    }));
  };

  const handleSubmitInteractive = () => {
      if (isAnswered) return;
      setIsAnswered(true);
      
      if (currentStep.type === 'interactive_balance') {
          setSubmittedAnswer(sliderValue);
          if (sliderValue === currentStep.correctAnswer) {
              addExp(currentStep.exp || 0);
              setSessionExp(prev => prev + (currentStep.exp || 0));
          }
      } else if (currentStep.type === 'interactive_sorting' && sortingChoice) {
          const isCorrect = sortingChoice === currentStep.scenarios[currentScenarioIndex].wiseChoice;
          if (isCorrect) {
              addExp(currentStep.exp || 0);
              setSessionExp(prev => prev + (currentStep.exp || 0));
          }
      }
  };

  const handleSortingClick = (choice: 'Good Debt' | 'Bad Debt') => {
      if (isAnswered) return;
      setSortingChoice(choice);
      handleSubmitInteractive(); // Auto-submit on choice
  }


  const isCorrectInteractive = useMemo(() => {
    if (currentStep.type === 'interactive_balance' && submittedAnswer !== null) {
        return submittedAnswer === currentStep.correctAnswer;
    }
    if (currentStep.type === 'interactive_sorting' && sortingChoice !== null) {
        return sortingChoice === currentStep.scenarios[currentScenarioIndex].wiseChoice;
    }
    return false;
  }, [currentStep, submittedAnswer, sortingChoice, currentScenarioIndex]);

  const showContinueButton = useMemo(() => {
    if (['lesson_intro', 'allocation_feedback'].includes(currentStep.type)) return true;
    if (currentStep.type === 'interactive_sandbox') return sandboxState.remaining === 0;
    if (currentStep.type === 'question') return isAnswered && selectedOption?.isCorrect;
    if (['interactive_balance', 'interactive_sorting'].includes(currentStep.type)) return isAnswered && isCorrectInteractive;
    return false;
  }, [currentStep.type, isAnswered, selectedOption, sandboxState.remaining, isCorrectInteractive]);

  const showTryAgainButton = (currentStep.type === 'question' && isAnswered && !selectedOption?.isCorrect) || (['interactive_balance', 'interactive_sorting'].includes(currentStep.type) && isAnswered && !isCorrectInteractive);

  const getOptionButtonClass = (option: any) => {
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
        const { totalBudget, increment } = currentStep;
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

    case 'allocation_feedback': {
        const sandboxStep = lessonData.steps.find(s => s.type === 'interactive_sandbox');
        if (sandboxStep?.type !== 'interactive_sandbox') return null;

        const { recommendedAllocation } = currentStep;
        const totalBudget = sandboxStep.totalBudget;

        const results = [
            {
                category: 'Needs',
                yourPercentage: (sandboxState.needs / totalBudget) * 100,
                targetPercentage: recommendedAllocation.needs,
            },
            {
                category: 'Wants',
                yourPercentage: (sandboxState.wants / totalBudget) * 100,
                targetPercentage: recommendedAllocation.wants,
            },
            {
                category: 'Savings',
                yourPercentage: (sandboxState.savings / totalBudget) * 100,
                targetPercentage: recommendedAllocation.savings,
            },
        ];
        
        const getFeedback = (your: number, target: number) => {
            const diff = Math.abs(your - target);
            if (diff <= 5) return { text: "On Track", color: "text-green-600" };
            if (your > target) return { text: "A bit high", color: "text-amber-600" };
            return { text: "A bit low", color: "text-amber-600" };
        };

        return (
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
                <div className="w-full max-w-lg space-y-4">
                    {results.map(result => (
                        <Card key={result.category} className="p-4 flex items-center justify-between">
                            <div className="text-left">
                                <p className="font-bold text-lg text-foreground">{result.category}</p>
                                <p className="text-sm text-muted-foreground">Target: {result.targetPercentage}%</p>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-xl text-primary">{result.yourPercentage.toFixed(0)}%</p>
                                 <p className={cn("text-sm font-bold", getFeedback(result.yourPercentage, result.targetPercentage).color)}>
                                    {getFeedback(result.yourPercentage, result.targetPercentage).text}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    case 'interactive_sorting': {
        const { scenarios } = currentStep;
        const currentScenario = scenarios[currentScenarioIndex];
        const ScenarioIcon = iconMap[currentScenario.icon as keyof typeof iconMap] || ToyBrick;

        return (
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="font-extrabold text-2xl sm:text-4xl mb-2 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>

                <Card className="p-6 mb-8 w-full max-w-md shadow-soft border-2 border-primary/20">
                    <div className="flex items-center justify-center space-x-4">
                         <ScenarioIcon className="w-10 h-10 text-primary flex-shrink-0" />
                        <p className="font-bold text-lg text-foreground">{currentScenario.name}</p>
                    </div>
                </Card>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        onClick={() => handleSortingClick('Good Debt')}
                        disabled={isAnswered}
                        className="h-auto p-6 flex flex-col items-center space-y-2 rounded-2xl border-4 border-dashed border-green-500/50 hover:border-green-500 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <ThumbsUp className="w-10 h-10 text-green-500 mb-2" />
                        <span className="font-extrabold text-xl text-green-600">Good Debt</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleSortingClick('Bad Debt')}
                        disabled={isAnswered}
                        className="h-auto p-6 flex flex-col items-center space-y-2 rounded-2xl border-4 border-dashed border-red-500/50 hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <ThumbsDown className="w-10 h-10 text-red-500 mb-2" />
                        <span className="font-extrabold text-xl text-red-600">Bad Debt</span>
                    </Button>
                </div>
            </div>
        )
    }
      
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

                  <div className="w-full h-32 md:h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{fontSize: 12}}/>
                              <YAxis hide={true} domain={[0, max * 1.2]}/>
                              <Tooltip content={<EmptyTooltip />} />
                              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40}>
                                  <LabelList dataKey="value" position="top" formatter={(value: number) => formatCurrency(value)} style={{ fontSize: '12px' }}/>
                              </Bar>
                              {isAnswered && (
                                <ReferenceLine 
                                  x={chartData.find(d => d.value === submittedAnswer)?.label}
                                  stroke={isCorrectInteractive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                                  strokeWidth={2}
                                  label={{ 
                                      value: isCorrectInteractive ? 'Balanced!' : 'Try Again',
                                      position: 'insideTop', 
                                      fill: isCorrectInteractive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                                      fontSize: 14,
                                      fontWeight: 'bold'
                                  }}
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
            <Award className="w-24 h-24 text-yellow-500 mb-6" />
            <h2 className="font-extrabold text-2xl sm:text-4xl mb-4 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-prose mb-8">{currentStep.text}</p>
            <div className="p-4 bg-primary/10 rounded-2xl">
                <p className="text-sm font-bold text-primary">Total Experience Earned</p>
                <p className="text-3xl font-extrabold text-primary">{sessionExp} XP</p>
            </div>
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
    } else if (currentStep.type === 'interactive_sorting') {
        isCorrect = isCorrectInteractive;
        feedbackText = isCorrect ? currentStep.scenarios[currentScenarioIndex].feedback.correct : currentStep.scenarios[currentScenarioIndex].feedback.incorrect;
    }
     else {
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
          <CardTitle className="font-extrabold text-2xl sm:text-3xl text-foreground">{lessonData.title}</CardTitle>
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
