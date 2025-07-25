
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, PiggyBank, ShoppingCart, Home, Scale, Award, ThumbsUp, ThumbsDown, GraduationCap, Briefcase, Handshake, ToyBrick, Landmark, TrendingUp, Wallet, Banknote, Shield, LineChart, Activity } from 'lucide-react';
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
export function FinQuest({ lessonData, lessonId }: { lessonData: LessonData; lessonId: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [sortingChoice, setSortingChoice] = useState<'Good Debt' | 'Bad Debt' | null>(null);
  const [sortingScenarioIndex, setSortingScenarioIndex] = useState(0);
  
  // Lifted state for risk/return
  const [riskReturnAllocation, setRiskReturnAllocation] = useState(50); // Percentage for investments

  const { addExp, completeLesson, completedLessons } = useUserProgress();
  const [sessionExp, setSessionExp] = useState(0);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState<{ title: string; description: string; action: () => void } | null>(null);


  const [sandboxState, setSandboxState] = useState({
    remaining: 0,
    needs: 0,
    wants: 0,
    savings: 0,
  });

   const [scenarioState, setScenarioState] = useState({
    currentEventIndex: 0,
    savings: 0,
    debt: 0,
    investments: 0,
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
        setSortingScenarioIndex(Math.floor(Math.random() * step.scenarios.length));
    } else if (step.type === 'interactive_risk_return') {
      // Don't reset riskReturnAllocation here, so it persists
    } else if (step.type === 'interactive_scenario') {
      setScenarioState({
        currentEventIndex: 0,
        ...step.initialState,
      });
    }
  }, [currentStepIndex, lessonData.steps]);

  // Mark lesson as complete when final step is reached
   useEffect(() => {
    if (currentStep.type === 'final') {
        // Check if the lesson is already completed before awarding EXP
        if (!completedLessons.includes(lessonId)) {
            addExp(sessionExp);
            completeLesson(lessonId);
        }
    }
  }, [currentStep, lessonId, completeLesson, sessionExp, addExp, completedLessons]);


  const handleOptionClick = (option: any) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (['question', 'interactive_balance', 'interactive_sorting'].includes(currentStep.type)) {
       const isCorrect = currentStep.type === 'question' ? selectedOption?.isCorrect : isCorrectInteractive;
       if(isCorrect) {
            setSessionExp(prev => prev + (currentStep.exp || 0));
       }
    } else {
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

    // Reset specific state for the current step type
    const step = lessonData.steps[currentStepIndex];
    if (step.type === 'interactive_balance') {
        const { data } = step;
        const values = data.map(d => d.value);
        setSliderValue(Math.min(...values));
    } else if (step.type === 'interactive_sorting') {
        // Optional: pick a new scenario on try again
        const newIndex = (sortingScenarioIndex + 1) % step.scenarios.length;
        setSortingChoice(null);
        setSortingScenarioIndex(newIndex);
    }
  }

  // Effect for handling interactive sorting logic
  useEffect(() => {
    if (sortingChoice === null) return; // Only run when a choice is made

    const step = lessonData.steps[currentStepIndex];
    if (step.type !== 'interactive_sorting') return;
    
    setIsAnswered(true); // Now set isAnswered after processing the choice
  }, [sortingChoice, currentStepIndex, lessonData.steps, sortingScenarioIndex]);
  
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
      
      if (currentStep.type === 'interactive_balance') {
          setIsAnswered(true);
          setSubmittedAnswer(sliderValue);
      }
  };

  const handleSortingClick = (choice: 'Good Debt' | 'Bad Debt') => {
      if (isAnswered) return;
      setSortingChoice(choice);
      // The logic is now handled by the useEffect hook that watches sortingChoice
  }

  const handleScenarioChoice = (choice: any) => {
    if (currentStep.type !== 'interactive_scenario') return;
  
    const applyChanges = () => {
      // Apply impact
      setScenarioState(prev => ({
        ...prev,
        savings: prev.savings + (choice.impact.savings || 0),
        debt: prev.debt + (choice.impact.debt || 0),
        investments: prev.investments + (choice.impact.investments || 0),
        currentEventIndex: prev.currentEventIndex + 1,
      }));
       setSessionExp(prev => prev + (choice.exp || 0));
    };
  
    // Show feedback dialog
    setFeedbackContent({
      title: choice.isWiseChoice ? "Wise Decision!" : "Risky Move!",
      description: choice.feedback,
      action: applyChanges
    });
    setFeedbackDialogOpen(true);
  };


  const isCorrectInteractive = useMemo(() => {
    const step = lessonData.steps[currentStepIndex];
    if (step.type === 'interactive_balance' && submittedAnswer !== null) {
        return submittedAnswer === step.correctAnswer;
    }
    if (step.type === 'interactive_sorting' && sortingChoice !== null) {
        return sortingChoice === step.scenarios[sortingScenarioIndex].wiseChoice;
    }
    return false;
  }, [lessonData.steps, currentStepIndex, submittedAnswer, sortingChoice, sortingScenarioIndex]);

  const showContinueButton = useMemo(() => {
    if (['lesson_intro', 'allocation_feedback', 'interactive_risk_return', 'risk_return_feedback'].includes(currentStep.type)) return true;
    if (currentStep.type === 'interactive_sandbox') return sandboxState.remaining === 0;
    if (currentStep.type === 'interactive_scenario') {
      return scenarioState.currentEventIndex >= currentStep.events.length;
    }
    if (currentStep.type === 'question') return isAnswered;
    if (['interactive_balance', 'interactive_sorting'].includes(currentStep.type)) return isAnswered;
    return false;
  }, [currentStep.type, isAnswered, sandboxState.remaining, scenarioState, currentStep]);

  const showTryAgainButton = useMemo(() => {
    if (currentStep.type === 'question') return isAnswered && !selectedOption?.isCorrect;
    if (['interactive_balance', 'interactive_sorting'].includes(currentStep.type)) return isAnswered && !isCorrectInteractive;
    return false;
  }, [currentStep, isAnswered, selectedOption, isCorrectInteractive]);


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
                    className="max-h-[200px] sm:max-h-[300px] object-contain mb-6 sm:mb-8 rounded-2xl"
                />
                <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>
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
            <h2 className="font-extrabold text-2xl sm:text-3xl mb-2 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-6">{currentStep.text}</p>
            
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
                <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>
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
        const currentScenario = scenarios[sortingScenarioIndex];
        const ScenarioIcon = iconMap[currentScenario.icon as keyof typeof iconMap] || ToyBrick;

        return (
            <div className="flex flex-col items-center text-center w-full">
                <h2 className="font-extrabold text-2xl sm:text-3xl mb-2 text-foreground">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>

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
                  <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{currentStep.title}</h2>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>
                  
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

      case 'interactive_risk_return': {
        const { totalAmount, options, years } = currentStep;
        
        const investmentAmount = totalAmount * (riskReturnAllocation / 100);
        const savingsAmount = totalAmount * (1 - (riskReturnAllocation / 100));

        const calculateFutureValue = (principal: number, rate: number, years: number) => {
            return principal * Math.pow((1 + rate), years);
        };

        const futureSavings = calculateFutureValue(savingsAmount, options.savings.annualReturn, years);
        const futureInvestments = calculateFutureValue(investmentAmount, options.investments.annualReturn, years);
        const totalFutureValue = futureSavings + futureInvestments;
        const totalEarnings = totalFutureValue - totalAmount;

        const chartData = [
          { name: 'Savings', value: futureSavings, initial: savingsAmount, fill: 'var(--chart-1)' },
          { name: 'Investments', value: futureInvestments, initial: investmentAmount, fill: 'var(--chart-2)' },
        ];

        return (
          <div className="w-full flex flex-col items-center">
            <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-center text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8 text-center">{currentStep.text}</p>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-4 text-center">
                <Card className="p-4 bg-blue-500/10">
                    <div className="flex justify-center items-center gap-2 mb-2"><Landmark className="h-5 w-5 text-blue-600"/> <h3 className="font-bold text-blue-800">Savings</h3></div>
                    <p className="font-extrabold text-xl sm:text-2xl text-blue-600">{100 - riskReturnAllocation}%</p>
                    <p className="text-sm font-bold text-muted-foreground">{formatCurrency(savingsAmount)}</p>
                </Card>
                 <Card className="p-4 bg-green-500/10">
                    <div className="flex justify-center items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-green-600"/> <h3 className="font-bold text-green-800">Investments</h3></div>
                    <p className="font-extrabold text-xl sm:text-2xl text-green-600">{riskReturnAllocation}%</p>
                    <p className="text-sm font-bold text-muted-foreground">{formatCurrency(investmentAmount)}</p>
                </Card>
            </div>
             <Slider
                value={[riskReturnAllocation]}
                onValueChange={(value) => setRiskReturnAllocation(value[0])}
                step={1}
                className="w-full max-w-sm my-6"
            />
            <div className="w-full max-w-md h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide/>
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                            formatter={(value: number, name, props) => [formatCurrency(value), props.payload.name]}
                        />
                        <Bar dataKey="value" name="Future Value" radius={[0, 8, 8, 0]}>
                           <LabelList 
                                dataKey="value"
                                position="right"
                                formatter={(value: number) => formatCurrency(value)}
                                className="font-bold fill-foreground"
                           />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <Card className="p-4 bg-primary/10 w-full max-w-sm">
                <p className="text-sm font-bold text-primary text-center">Projected Value in {years} Years</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary text-center">{formatCurrency(totalFutureValue)}</p>
                <p className="text-sm font-bold text-muted-foreground text-center">(Earnings: {formatCurrency(totalEarnings)})</p>
            </Card>
          </div>
        );
      }
      
      case 'risk_return_feedback': {
        const { highRisk, lowRisk, balanced } = currentStep.feedback;
        let feedback;
        let Icon;

        if (riskReturnAllocation > 70) {
            feedback = highRisk;
            Icon = TrendingUp;
        } else if (riskReturnAllocation < 30) {
            feedback = lowRisk;
            Icon = Landmark;
        } else {
            feedback = balanced;
            Icon = Activity;
        }
        
        return (
            <div className="flex flex-col items-center text-center w-full max-w-lg">
                 <div className="p-4 bg-primary/10 rounded-full mb-6">
                    <Icon className="w-10 h-10 text-primary" />
                 </div>
                <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{feedback.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">{feedback.text}</p>
            </div>
        )
      }

      case 'interactive_scenario': {
        const { events } = currentStep;
        const currentEvent = events[scenarioState.currentEventIndex];

        if (!currentEvent) {
          // All events are done, maybe show a summary before continue button appears
          return (
            <div className="text-center">
              <h3 className="font-bold text-xl mb-4">Year End Summary</h3>
              <p>You've navigated the challenges of the year. Check your final financial status below!</p>
            </div>
          );
        }

        return (
          <div className="w-full flex flex-col items-center">
             <h2 className="font-extrabold text-xl sm:text-2xl mb-4 text-center text-foreground">{currentStep.title}</h2>
             {/* Dashboard */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-6 text-center">
              <Card className="p-2 sm:p-4">
                <div className="flex justify-center items-center gap-2 mb-1"><Wallet className="h-5 w-5 text-green-600"/> <h3 className="text-sm font-bold text-muted-foreground">Savings</h3></div>
                <p className="font-extrabold text-lg sm:text-xl text-foreground">{formatCurrency(scenarioState.savings)}</p>
              </Card>
              <Card className="p-2 sm:p-4">
                <div className="flex justify-center items-center gap-2 mb-1"><Banknote className="h-5 w-5 text-red-600"/> <h3 className="text-sm font-bold text-muted-foreground">Debt</h3></div>
                <p className="font-extrabold text-lg sm:text-xl text-foreground">{formatCurrency(scenarioState.debt)}</p>
              </Card>
              <Card className="p-2 sm:p-4">
                <div className="flex justify-center items-center gap-2 mb-1"><TrendingUp className="h-5 w-5 text-blue-600"/> <h3 className="text-sm font-bold text-muted-foreground">Investments</h3></div>
                <p className="font-extrabold text-lg sm:text-xl text-foreground">{formatCurrency(scenarioState.investments)}</p>
              </Card>
            </div>

            {/* Event Card */}
            <Card className="w-full p-4 sm:p-6 shadow-soft border-primary/20">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="font-extrabold text-lg sm:text-xl text-foreground">{currentEvent.title}</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{currentEvent.text}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4">
                    {currentEvent.choices.map((choice, index) => (
                        <Button key={index} variant="outline" size="lg" className="h-auto p-3 text-sm sm:p-4 sm:text-base justify-center text-center sm:justify-start sm:text-left" onClick={() => handleScenarioChoice(choice)}>
                            {choice.text}
                        </Button>
                    ))}
                </div>
            </Card>
          </div>
        );
      }
        
      case 'question':
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>
            <div className="w-full max-w-md space-y-3 sm:space-y-4 mb-8">
              {currentStep.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full h-auto justify-start p-3 sm:p-4 text-left font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-300 ease-in-out transform",
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
            <h2 className="font-extrabold text-2xl sm:text-3xl mb-4 text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-prose mb-8">{currentStep.text}</p>
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
        if (!isCorrect) {
          feedbackText = currentStep.scenarios[sortingScenarioIndex].feedback.incorrect;
        } else {
          feedbackText = currentStep.scenarios[sortingScenarioIndex].feedback.correct;
        }
    }
     else {
        return null;
    }

    if (!feedbackText) return null;

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
    <>
    <Card className="w-full max-w-3xl shadow-soft font-body">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="font-extrabold text-lg sm:text-2xl text-foreground">{lessonData.title}</CardTitle>
        </div>
        <Progress value={progress} className="w-full h-3 bg-accent" />
      </CardHeader>
      <CardContent className="px-4 py-6 sm:p-6 flex flex-col items-center justify-between min-h-[450px] sm:min-h-[500px]">
        
        <div className="w-full flex-grow flex flex-col items-center justify-center">
            {renderContent()}

            {isAnswered && (currentStep.type === 'question' || currentStep.type === 'interactive_balance' || currentStep.type === 'interactive_sorting') && renderFeedback()}
        </div>

        <div className="mt-8 pt-4 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          {showContinueButton && (
            <Button 
              onClick={handleContinue} 
              size="lg"
              className="w-full sm:w-auto font-extrabold text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform bg-primary hover:bg-accent-hover"
            >
              {currentStep.type === 'lesson_intro' ? 'Start Learning' : 'Continue'}
            </Button>
          )}
          {showTryAgainButton && (
            <Button 
              onClick={handleTryAgain} 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto font-extrabold text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform hover:bg-accent-hover"
            >
              Try Again
            </Button>
          )}
           {currentStep.type === 'final' && (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform bg-primary hover:bg-accent-hover">
                    <a href="/">Back to Courses</a>
                </Button>
                <Button 
                    onClick={handleRestart} 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto font-extrabold text-lg px-10 py-6 rounded-2xl shadow-md hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-in-out transform hover:bg-accent-hover"
                    >
                    Start Over
                </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    {feedbackContent && (
        <AlertDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{feedbackContent.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {feedbackContent.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => {
                        feedbackContent.action();
                        setFeedbackDialogOpen(false);
                    }}>
                        Understood
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}

    

    