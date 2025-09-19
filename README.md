# Diano Times

Welcome to Diano Times, a modern, full-stack news and blog platform built with Next.js, Firebase, and Genkit. This application serves as a feature-rich starting point for creating dynamic, content-driven websites with a built-in admin panel for managing posts.

## Features

- **Modern Frontend**: Built with Next.js 15 and the App Router for a fast, optimized, and scalable user experience.
- **Component-Based UI**: A beautiful and consistent user interface powered by ShadCN UI and Tailwind CSS.
- **Full-Stack with Firebase**:
  - **Firestore**: A NoSQL database for storing and managing blog posts.
  - **Firebase Authentication**: Secure email/password authentication for the admin dashboard.
- **AI-Powered Features**:
  - **Genkit Integration**: Leverages Google's Genkit to integrate generative AI.
  - **Automatic Slug Generation**: An AI-powered flow generates URL-friendly slugs from post titles automatically.
- **Admin Dashboard**:
  - A secure, client-side rendered dashboard for administrators.
  - **CRUD Operations**: Create, read, update, and delete posts.
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

## Project Structure

```
.
├── src
│   ├── ai                  # Genkit AI flows and configuration
│   ├── app                 # Next.js App Router pages and layouts
│   │   ├── admin           # Admin dashboard routes
│   │   ├── posts           # Dynamic routes for individual posts
│   │   └── ...             # Main site pages (home, login, etc.)
│   ├── components          # Reusable React components
│   │   ├── admin           # Components specific to the admin dashboard
│   │   └── ui              # ShadCN UI components
│   ├── hooks               # Custom React hooks
│   └── lib                 # Core logic, Firebase setup, actions, schemas
├── .env.local              # Environment variables (needs to be created)
└── ...                     # Configuration files
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

# Genkit/Gemini AI Config
GEMINI_API_KEY=AIz...
```

**Note**: You can obtain your Firebase configuration from the Firebase Console by navigating to **Project Settings > Your apps**. The `GEMINI_API_KEY` is required for the Genkit AI features.

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
- Use those credentials to log in on the `/login` page.
