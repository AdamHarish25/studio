import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Menu, Zap, Gem } from 'lucide-react';

export function Header() {
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
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu button could go here */}
          </div>
          <nav className="flex items-center">
            <Button variant="outline" className="mr-2 hidden sm:flex">
                <Zap className="mr-2 h-4 w-4 text-yellow-500"/> 14
            </Button>
             <Button variant="secondary" className="hidden sm:flex">
              Go Premium
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
