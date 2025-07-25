"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserProgressContextType = {
  totalExp: number;
  setTotalExp: React.Dispatch<React.SetStateAction<number>>;
  addExp: (amount: number) => void;
};

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const [totalExp, setTotalExp] = useState(14); // Initial value

  const addExp = (amount: number) => {
    setTotalExp(prevExp => prevExp + amount);
  };

  return (
    <UserProgressContext.Provider value={{ totalExp, setTotalExp, addExp }}>
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
