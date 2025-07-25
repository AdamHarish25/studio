"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Menu, Zap, Gem } from 'lucide-react';
import { useUserProgress } from '@/context/user-progress-context';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { totalExp } = useUserProgress();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              FinQuest
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
             <Button variant="ghost" asChild className="text-muted-foreground transition-colors hover:text-foreground">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                </Link>
            </Button>
            <Button variant="ghost" asChild className="text-foreground font-semibold border-b-2 border-primary rounded-none">
                 <Link href="/">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Courses
                </Link>
            </Button>
          </nav>
        </div>
        
        {/* Mobile Header */}
        <div className="flex flex-1 items-center justify-between md:hidden">
            <Link href="/" className="flex items-center space-x-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold">FinQuest</span>
            </Link>
             <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="ghost"
                    size="icon"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SheetDescription className="sr-only">
                            Navigate the application, view your experience points, or go premium.
                        </SheetDescription>
                    </SheetHeader>
                     <nav className="grid gap-4 text-lg font-medium mt-8">
                        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                           <Home className="h-5 w-5" />
                           Home
                        </Link>
                        <Link href="/" className="flex items-center gap-2 text-foreground font-semibold">
                           <BookOpen className="h-5 w-5" />
                           Courses
                        </Link>
                        <Button variant="outline" className="w-full justify-start">
                           <Zap className="mr-2 h-4 w-4 text-yellow-500"/> {totalExp}
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                           Go Premium
                        </Button>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
        
        {/* Desktop Header Actions */}
        <div className="hidden flex-1 items-center justify-end space-x-2 md:flex">
          <nav className="flex items-center">
            <Button variant="outline" className="mr-2 flex">
                <Zap className="mr-2 h-4 w-4 text-yellow-500"/> {totalExp}
            </Button>
             <Button variant="secondary" className="flex">
              Go Premium
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
