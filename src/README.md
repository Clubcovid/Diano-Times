# Diano Times

Welcome to Diano Times, a modern, full-stack news and blog platform built with Next.js, Firebase, and Genkit. This application serves as a feature-rich starting point for creating dynamic, content-driven websites with a built-in admin panel for managing posts.

## Features

- **Modern Frontend**: Built with Next.js 15 and the App Router for a fast, optimized, and scalable user experience.
- **Component-Based UI**: A beautiful and consistent user interface powered by ShadCN UI and Tailwind CSS.
- **Dark Mode**: A user-selectable dark mode for improved readability in low-light environments.
- **Full-Stack with Firebase**:
  - **Firestore**: A NoSQL database for storing and managing blog posts.
  - **Firebase Authentication**: Secure email/password and Google social login for the admin dashboard.
- **AI-Powered Features**:
  - **Genkit Integration**: Leverages Google's Genkit to integrate generative AI.
  - **Automatic Slug Generation**: An AI-powered flow generates URL-friendly slugs from post titles automatically.
  - **AI Weather Ticker**: An example AI flow to fetch and display weather data (currently using mock data to avoid rate limits).
- **Admin Dashboard**:
  - A secure, client-side rendered dashboard for administrators.
  - **CRUD Operations**: Create, read, update, and delete posts, advertisements, and videos.
  - **Post Management**: View all posts in a sortable, paginated table.
  - **Rich Text Editor**: A `textarea` that supports Markdown for writing content.
- **Responsive Design**: The application is fully responsive and optimized for viewing on desktops, tablets, and mobile devices.
- **Schema Validation**: Uses `zod` for robust form and data validation on both the client and server.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Project Architecture

This project is built on a modern, full-stack architecture leveraging Next.js and Firebase.

### Frontend
- **Next.js App Router**: The application uses the App Router for routing, which allows for nested layouts, server components, and granular control over loading states.
- **React Server Components (RSC)**: By default, pages and components are React Server Components, which run on the server to improve performance by reducing the amount of JavaScript sent to the client. This is used for fetching and displaying data on pages like the homepage and individual post pages.
- **Client Components**: Components requiring user interaction, state, or lifecycle effects (e.g., forms, buttons, interactive UI elements) are marked with the `'use client'` directive. The admin dashboard is primarily client-rendered to provide a rich, interactive experience.
- **Styling**: Styling is handled by **Tailwind CSS** for utility-first styling and **ShadCN UI** for the base component library. The theme (colors, fonts, etc.) is configured in `src/app/globals.css` and `tailwind.config.ts`, with dark mode support.
- **State Management**:
    - **Local State**: Managed with `useState` and `useReducer` hooks within client components.
    - **Global State**: React Context is used for global state management, specifically for authentication (`src/components/auth-provider.tsx`) and theme switching (`src/components/theme-provider.tsx`).

### Backend and Data
- **Next.js Server Actions**: Form submissions and data mutations (Create, Update, Delete) are handled using Server Actions (`src/lib/actions.ts`). This allows client components to call secure, server-side functions directly without needing to create separate API endpoints.
- **Firebase Firestore**: The primary database is a NoSQL Firestore database. Data is organized into collections:
    - `posts`: Stores all blog post content, metadata, and status.
    - `users`: Managed by Firebase Authentication, with user profiles accessible for admin display.
    - `advertisements`: Stores ad-related data like image URLs, links, and titles.
    - `videos`: Stores YouTube video links and titles.
- **Firebase Authentication**: Handles user registration and login (Email/Password and Google). Access to the admin panel is restricted to a specific admin email address, as defined in `src/app/admin/layout.tsx`.

### AI Integration
- **Genkit**: All generative AI features are powered by Genkit.
- **AI Flows**: Genkit "flows" are defined in the `src/ai/flows` directory. These are server-side functions that interact with a Generative Model (e.g., Gemini).
    - `generate-url-friendly-slug.ts`: An AI flow that takes a post title and generates a URL-safe slug.
    - `get-weather-forecast.ts`: An AI flow that fetches weather data for a given location.
- **Schema Definition**: Zod (`zod`) is used to define the input and output schemas for AI flows, ensuring type safety and structured data.

### Project Structure

```
.
├── src
│   ├── ai                  # Genkit AI flows and configuration
│   │   ├── flows           # Individual AI flow definitions
│   │   └── genkit.ts       # Genkit initialization
│   ├── app                 # Next.js App Router pages and layouts
│   │   ├── admin           # Admin dashboard routes
│   │   ├── posts           # Dynamic routes for individual posts
│   │   └── ...             # Main site pages (home, login, about, video, etc.)
│   ├── components          # Reusable React components
│   │   ├── admin           # Components specific to the admin dashboard
│   │   ├── icons           # Custom SVG icon components
│   │   ├── ui              # ShadCN UI components
│   │   └── ...             # Other shared components (blog-header, post-card, etc.)
│   ├── hooks               # Custom React hooks (useToast, use-mobile)
│   └── lib                 # Core logic, Firebase setup, actions, schemas
│       ├── actions.ts      # Server Actions for data mutation
│       ├── firebase.ts     # Client-side Firebase initialization
│       ├── firebase-admin.ts # Server-side Firebase Admin SDK initialization
│       ├── mock-data.ts    # Fallback mock data for posts, ads, etc.
│       ├── posts.ts        # Functions for fetching post data
│       ├── schemas.ts      # Zod schemas for form and data validation
│       └── types.ts        # TypeScript type definitions
├── .env                    # Environment variables (needs to be created)
└── ...                     # Configuration files (next.config.ts, tailwind.config.ts, etc.)
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/) or a compatible package manager

### 1. Install Dependencies

Clone the repository and install the required packages:

```bash
npm install
```

### 2. Set Up Environment Variables

This project requires a Firebase project to run. The application is configured to connect to Firebase using environment variables.

Create a `.env` file in the root of your project and add your Firebase project's configuration keys:

```
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# Firebase Admin SDK (for server-side operations)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Genkit/Gemini AI Config
GEMINI_API_KEY=AIz...
```

**Note**: You can obtain your Firebase configuration from the Firebase Console by navigating to **Project Settings > Your apps**. The Admin SDK credentials can be generated from **Project Settings > Service accounts**. The `GEMINI_API_KEY` is required for the Genkit AI features. If you run the app without these keys, it will use mock data where possible.

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### 4. Run the Genkit Developer UI

To develop and test AI flows, run the Genkit development UI in a separate terminal:

```bash
npm run genkit:dev
```

This will start the Genkit development server, typically available at `http://localhost:4000`.

## Admin Access

- The admin dashboard is located at `/admin`.
- To access it, you first need to create a user in your Firebase project via the Firebase Console (Authentication tab).
- The admin account email is hardcoded in `src/app/admin/layout.tsx`. By default, it is `georgedianoh@gmail.com`. You can change this to your own email address.
- Use those credentials to log in on the `/login` page.
