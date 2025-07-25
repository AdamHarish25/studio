"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type UserProgressContextType = {
  totalExp: number;
  setTotalExp: React.Dispatch<React.SetStateAction<number>>;
  addExp: (amount: number) => void;
  completedLessons: string[];
  completeLesson: (lessonId: string) => void;
};

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const [totalExp, setTotalExp] = useState(14); // Initial value
  const [completedLessons, setCompletedLessons] = useState<string[]>(['l1']); // Start with lesson 1 completed

  const addExp = useCallback((amount: number) => {
    setTotalExp(prevExp => prevExp + amount);
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    setCompletedLessons(prev => {
        if (prev.includes(lessonId)) {
            return prev;
        }
        return [...prev, lessonId];
    });
  }, []);

  return (
    <UserProgressContext.Provider value={{ totalExp, setTotalExp, addExp, completedLessons, completeLesson }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};
