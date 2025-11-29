# FocusFlow - Personal Task Manager & Assistant

FocusFlow is a personal task manager that uses AI to parse natural language tasks into structured data and syncs them with Google Calendar.

## Features

- Natural Language Processing for task parsing
- Google Calendar integration
- Task prioritization and time estimation
- Clean, intuitive UI with Tailwind CSS

## Prerequisites

Before you begin, ensure you have:
1. Node.js (v16 or higher)
2. Google Cloud Console account with Calendar API enabled
3. Google OAuth 2.0 Client IDs
4. OpenAI or Gemini API key (for NLP processing)

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 Client IDs (Web application)
6. Add `http://localhost:3000` to Authorized JavaScript origins
7. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Supabase (optional for future use)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider (choose one)
OPENAI_API_KEY=your_openai_api_key
# or
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication routes
│   │   │   └── parse-task/  # NLP processing endpoint
│   │   ├── components/      # Shared components
│   │   └── lib/             # Utility functions
│   └── lib/                 # Library functions
├── public/                  # Static assets
└── .env.local              # Environment variables
```

## Authentication

FocusFlow uses NextAuth.js for authentication with Google as the provider. The authentication flow includes:

1. Google OAuth with offline access for Calendar API
2. JWT token management with refresh token support
3. Session persistence with access tokens

## API Endpoints

### `/api/auth/[...nextauth]`
Handles authentication flows with Google OAuth.

### `/api/parse-task`
Accepts natural language task descriptions and returns structured task data using AI.

## Libraries Used

- [Next.js 14](https://nextjs.org/) - React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication solution
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Google APIs](https://github.com/googleapis/google-api-nodejs-client) - Google Calendar integration
- [Supabase](https://supabase.io/) - Database (future implementation)

## Future Enhancements

- Integration with Supabase for task storage
- Advanced NLP processing with OpenAI/Gemini
- Task categorization and tagging
- Focus timer functionality
- Progress tracking and analytics