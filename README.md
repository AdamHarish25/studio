# FinQuest: Budget Basics

This is an interactive financial literacy module built with Next.js and designed to teach the fundamentals of budgeting through a "Learn -> Interact -> Test" flow.

## Core Concept

The application is structured as a single-page module that guides the user through a series of steps:
1.  **Learn**: An introductory screen presents the core concept with a title, descriptive text, and an engaging illustration.
2.  **Interact**: A hands-on "sandbox" environment allows users to apply the concept they've just learned. For example, they allocate a budget into different categories.
3.  **Review**: The app provides feedback on the user's interaction, comparing their choices to financial best practices (e.g., the 50/30/20 rule).
4.  **Test**: A series of questions, including multiple-choice and interactive visual challenges (like the balance beam), test the user's comprehension.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible components.
- **Charts**: [Recharts](https://recharts.org/) for creating interactive charts and graphs.
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (Boilerplate is present, but no AI features are currently implemented).

## Project Structure

The project follows a standard Next.js App Router structure. Here are the key files and directories:

-   `src/app/page.tsx`: The main entry point for the application. It renders the core `FinQuest` component.
-   `src/app/layout.tsx`: The root layout for the application, which includes the main HTML structure and font imports.
-   `src/app/globals.css`: Contains global styles, Tailwind CSS directives, and the color theme variables for both light and dark modes.
-   `src/components/fin-quest.tsx`: This is the most important component. It manages the state of the entire learning module, including the current step, user answers, and all interactive logic. It dynamically renders the content for each step based on its `type`.
-   `src/components/ui/`: This directory contains all the ShadCN UI components (Button, Card, Slider, etc.) used throughout the application.
-   `src/lib/utils.ts`: Contains utility functions, most notably `cn` for merging Tailwind CSS classes.
-   `public/`: Static assets, such as images, can be placed here.
-   `next.config.ts`: Configuration file for Next.js, including image optimization settings for external domains.
-   `package.json`: Lists all project dependencies and scripts.

## Getting Started

To run the project locally, follow these steps:

1.  **Install Dependencies**:
    The development environment typically handles this automatically. If you need to do it manually, run:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    To start the application in development mode, run:
    ```bash
    npm run dev
    ```

This will start the development server, and you can view the application by navigating to the URL provided in your terminal (usually `http://localhost:9002`). The application will automatically reload if you make changes to the code.
