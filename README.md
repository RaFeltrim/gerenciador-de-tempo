<!-- markdownlint-disable MD033 MD041 -->
<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/calendar.svg" alt="FocusFlow Logo" width="120" height="120">
</p>

<h1 align="center">FocusFlow</h1>

<p align="center">
  <strong>Your AI-Powered Personal Task Manager & Assistant</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/features-%E2%9C%A8-brightgreen" alt="Features"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/tech%20stack-%F0%9F%92%BB-blue" alt="Tech Stack"></a>
  <a href="#testing"><img src="https://img.shields.io/badge/testing-%F0%9F§9A-orange" alt="Testing"></a>
  <a href="https://github.com/RaFeltrim/gerenciador-de-tempo/issues"><img src="https://img.shields.io/github/issues/RaFeltrim/gerenciador-de-tempo" alt="GitHub Issues"></a>
  <a href="https://github.com/RaFeltrim/gerenciador-de-tempo/blob/main/LICENSE"><img src="https://img.shields.io/github/license/RaFeltrim/gerenciador-de-tempo" alt="GitHub License"></a>
</p>

<br>

FocusFlow is an intelligent task management application that transforms natural language into structured tasks and seamlessly integrates with Google Calendar. Built with cutting-edge technologies, it helps you organize your life and boost productivity through AI-powered assistance.

## 🌟 Key Features

- **🧠 AI-Powered Task Parsing** - Convert natural language into structured, actionable tasks
- **📅 Google Calendar Sync** - Automatically sync tasks with your Google Calendar
- **⏱️ Pomodoro Timer** - Built-in focus timer for enhanced productivity
- **📊 Progress Tracking** - Visual analytics and progress monitoring
- **🏷️ Smart Categorization** - Organize tasks with tags and categories
- **🔄 Recurring Tasks** - Set up daily, weekly, or monthly recurring tasks
- **📱 Responsive Design** - Works beautifully on all devices

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/RaFeltrim/gerenciador-de-tempo.git
cd gerenciador-de-tempo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application in action!

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|---------|------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js) ![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react) |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat&logo=tailwind-css) ![CSS3](https://img.shields.io/badge/CSS3-1.0-1572B6?style=flat&logo=css3) |
| **Authentication** | ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0-000000?style=flat) |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=flat&logo=supabase) |
| **APIs** | ![Google Calendar](https://img.shields.io/badge/Google%20Calendar-API-4285F4?style=flat&logo=google-calendar) |
| **Icons** | ![Lucide React](https://img.shields.io/badge/Lucide%20React-0.5-lightgrey?style=flat) |
| **Testing** | ![Jest](https://img.shields.io/badge/Jest-CI2127?style=flat&logo=jest) ![Cypress](https://img.shields.io/badge/Cypress-17202C?style=flat&logo=cypress) ![Robot Framework](https://img.shields.io/badge/Robot%20Framework-000000?style=flat&logo=robot-framework) |

</div>

## 📁 Project Structure

```
gerenciador-de-tempo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── calendar/       # Google Calendar integration
│   │   │   ├── parse-task/     # NLP processing endpoint
│   │   │   └── tasks/          # Task CRUD operations
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── components/         # Shared components
│   │   └── lib/                # Utility functions
│   ├── components/             # Reusable UI components
│   └── lib/                    # Library functions
├── __tests__/                  # Unit and integration tests
├── cypress/                    # E2E and component tests
├── tests/                      # Acceptance tests (Robot Framework)
├── public/                     # Static assets
├── types/                      # TypeScript type definitions
└── .env.local                 # Environment variables
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Google Cloud Console account with Calendar API enabled
- Supabase account for database
- OpenAI or Gemini API key (for NLP processing)

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 Client IDs (Web application)
6. Add `http://localhost:3000` to Authorized JavaScript origins
7. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs

### 2. Supabase Setup

1. Create a new project in [Supabase](https://supabase.io/)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Get your project URL and anon key from the Supabase dashboard

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider (choose one)
OPENAI_API_KEY=your_openai_api_key
# or
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Installation

```bash
npm install
```

### 5. Development

```bash
npm run dev
```

## 🧪 Testing

We follow a comprehensive testing strategy with a well-balanced test pyramid:

### Unit & Integration Tests (Jest)
```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

### Component & E2E Tests (Cypress)
```bash
npx cypress open          # Open Cypress UI
npx cypress run --component # Run component tests
npx cypress run --e2e     # Run E2E tests
```

### Acceptance Tests (Robot Framework)
```bash
robot tests/robot/        # Run acceptance tests
```

### Pre-commit Hooks
All tests are automatically run before each commit using Husky and lint-staged.

## 🔄 API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | Authentication flows |
| `/api/parse-task` | POST | Parse natural language into structured tasks |
| `/api/tasks` | GET/POST/PUT/DELETE | Task CRUD operations |
| `/api/calendar` | POST | Create events in Google Calendar |

## 🎯 Features Implemented

✅ **Core Functionality**
- Natural language task parsing
- Google Calendar integration
- Task categorization (Work, Personal, Study, Health, Finance, Other)
- Task tagging system
- Task editing functionality

✅ **Productivity Tools**
- Pomodoro timer functionality
- Progress tracking and analytics
- Recurring tasks support
- Priority management

✅ **Technical Features**
- Supabase integration with localStorage fallback
- Responsive design for all devices
- Session management with refresh tokens
- Comprehensive error handling

## 🚀 Future Enhancements

- [ ] Advanced NLP processing with OpenAI/Gemini
- [ ] Task reminders and notifications
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] Dark mode support
- [ ] Task dependencies and subtasks
- [ ] Export/import functionality

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rafael Feltrim** - *Initial work* - [RaFeltrim](https://github.com/RaFeltrim)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape FocusFlow
- Inspired by the need for better task management tools
- Built with ❤️ using amazing open-source technologies

---
<p align="center">
  Made with ❤️ by Rafael Feltrim
</p>