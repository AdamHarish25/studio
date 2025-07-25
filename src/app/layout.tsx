import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UserProgressProvider } from '@/context/user-progress-context';

export const metadata: Metadata = {
  title: 'FinQuest: Budget Basics',
  description: 'An interactive financial literacy module.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased font-semibold">
        <UserProgressProvider>
            {children}
            <Toaster />
        </UserProgressProvider>
      </body>
    </html>
  );
}
