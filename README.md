# Talk of Nations

Welcome to Talk of Nations, a modern, full-stack news and blog platform built with Next.js, Firebase, and Genkit. This application serves as a feature-rich starting point for creating dynamic, content-driven websites with a built-in admin panel and powerful AI capabilities.

## Features

- **Modern Frontend**: Built with Next.js 15 and the App Router for a fast, optimized, and scalable user experience.
- **Component-Based UI**: A beautiful and consistent user interface powered by ShadCN UI and Tailwind CSS, with dark mode support.
- **Full-Stack with Firebase**:
  - **Firestore**: A NoSQL database for storing posts, ads, videos, and settings.
  - **Firebase Authentication**: Secure email/password and Google social login.
  - **Firebase Storage**: For storing generated assets like PDF magazines.
- **AI-Powered Features (Genkit)**:
  - **Content Auto-Pilot**: Suggests trending topics and generates complete draft posts with a single click.
  - **URL Slug Generation**: AI-powered flow generates SEO-friendly slugs from post titles.
  - **Cover Image Generation**: Create stunning cover images for posts directly from a text prompt.
  -**Weekly Magazine Generator**: Automatically curates posts from the last week into a downloadable PDF magazine.
  - **Interactive Chatbot ("Ask Diano")**: An AI persona that can answer user questions by searching through your published articles.
- **Admin Dashboard**:
  - A secure, client-side rendered dashboard for administrators.
  - **CRUD Operations**: Create, read, update, and delete posts, advertisements, and videos.
  - **Post Management**: View all posts in a sortable table.
  - **AI Feature Management**: Globally enable or disable specific AI features with kill switches.
- **Social Media Integration**:
    - **Telegram**: Automatic notifications for new posts and user sign-ups, plus an interactive bot.
    - **Twitter/X**: Automatically tweet new articles when they are published.
- **Dynamic Widgets**:
    - **Election Countdown**: A configurable countdown timer for upcoming elections, managed from the admin panel.
    - **Weather & Market Tickers**: Live-updating tickers for weather forecasts and market data.
- **Responsive Design**: Fully responsive and optimized for desktops, tablets, and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (using Google's Gemini models)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Project Architecture

This project is built on a modern, full-stack architecture leveraging Next.js and Firebase.

### Frontend
- **Next.js App Router**: The application uses the App Router for routing, which allows for nested layouts, server components, and granular control over loading states.
- **React Server Components (RSC)**: Pages are primarily React Server Components, which run on the server to improve performance by reducing client-side JavaScript. This is used for fetching and displaying data on pages like the homepage and individual posts.
- **Client Components**: Components requiring user interaction or state (e.g., forms, buttons, interactive UI) are marked with the `'use client'` directive. The admin dashboard is client-rendered to provide a rich, interactive experience.
- **Styling**: Styling is handled by **Tailwind CSS** for utility-first styling and **ShadCN UI** for the base component library. The theme is configured in `src/app/globals.css`.
- **State Management**: React Context is used for global state management, specifically for authentication (`src/components/auth-provider.tsx`) and theme switching.

### Backend and Data
- **Next.js Server Actions**: Form submissions and data mutations (Create, Update, Delete) are handled using Server Actions (`src/lib/actions.tsx`). This allows client components to call secure, server-side functions directly without needing separate API endpoints.
- **Firebase Firestore**: The primary database is a NoSQL Firestore database. Key collections include:
    - `posts`: Stores all blog post content and metadata.
    - `users`: Managed by Firebase Authentication.
    - `advertisements`: Stores ad-related data.
    - `videos`: Stores YouTube video links.
    - `ai_settings`, `site_settings`: Store configurations for AI features and site widgets.
- **Firebase Authentication**: Handles user registration and login (Email/Password and Google).

### AI Integration
- **Genkit**: All generative AI features are powered by Genkit.
- **AI Flows**: Genkit "flows" are server-side functions that interact with a Generative Model (e.g., Gemini), defined in the `src/ai/flows` directory.
    - `generate-url-friendly-slug.ts`: Creates a URL-safe slug from a title.
    - `generate-post.ts`: Generates a complete blog post draft from a topic.
    - `suggest-topics.ts`: Suggests new article ideas.
    - `ask-diano-flow.ts`: Powers the interactive chatbot.
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
│   │   └── ...             # Main site pages (home, login, etc.)
│   ├── components          # Reusable React components
│   │   ├── admin           # Components specific to the admin dashboard
│   │   ├── ui              # ShadCN UI components
│   │   └── ...             # Other shared components (header, post cards, etc.)
│   ├── hooks               # Custom React hooks (e.g., useToast)
│   └── lib                 # Core logic, Firebase setup, actions, schemas
│       ├── actions.tsx     # Server Actions for data mutation
│       ├── firebase.ts     # Client-side Firebase initialization
│       ├── firebase-admin.ts # Server-side Firebase Admin SDK initialization
│       ├── posts.ts        # Functions for fetching post data
│       ├── schemas.ts      # Zod schemas for form and data validation
│       └── types.ts        # TypeScript type definitions
├── .env.local              # Environment variables (needs to be created)
└── ...                     # Configuration files
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following credentials.

#### A. Firebase Config (Client & Server)

1.  Go to the **Firebase Console** > **Project settings**.
2.  Under "Your apps", get your web app's **Config** object for the public keys.
3.  Under the "Service accounts" tab, **Generate new private key** for the admin keys.

```
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIz...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
# Important: Wrap the key in double quotes
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

#### B. Genkit/Gemini API Key

1.  Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key.

```
# Genkit/Gemini AI Config
GEMINI_API_KEY=AIz...
```
#### C. Social Media & API Keys (Optional)

These are needed for social media integrations and the weather ticker.

```
# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_NEWS_CHANNEL_ID=@YourChannelName
TELEGRAM_ADMIN_CHAT_ID=...

# Twitter / X
TWITTER_API_KEY=...
TWITTER_API_KEY_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...

# WeatherAPI.com Key
WEATHER_API_KEY=...
```

### 3. Run the Development Server

```
npm run dev
```
The application will be available at [http://localhost:9002](http://localhost:9002).

### 4. Run the Genkit Developer UI

To develop and test AI flows, run the Genkit UI in a separate terminal:
```bash
npm run genkit:dev
```
This will start the Genkit server, typically at `http://localhost:4000`.

## Admin Access

- The admin dashboard is at `/admin`.
- By default, access is restricted to the email `georgedianoh@gmail.com`. You can change this in `src/app/admin/layout.tsx`.
- Create the admin user account in your Firebase Console (Authentication tab), then log in via the `/login` page.
