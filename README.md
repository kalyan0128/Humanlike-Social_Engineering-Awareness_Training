# HumanLike-AwareBot: Social Engineering Awareness Training Platform

A cutting-edge academic web application designed to enhance social engineering awareness through an interactive, gamified training platform powered by advanced AI technologies.

![HumanLike-AwareBot Logo](generated-icon.png)

## Project Overview

HumanLike-AwareBot is an educational platform developed at Gannon University to help users recognize, understand, and defend against social engineering attacks. It uses an AI-powered chatbot to simulate realistic social engineering scenarios and provide personalized feedback.

### Key Features

- **Interactive Training Modules**: Learn through engaging, scenario-based lessons with quizzes.
- **AI-Powered Chatbot**: Practice identifying social engineering techniques in realistic conversations (Powered by Groq Llama 3 8B).
- **Threat Scenario Library**: Study real-world examples of social engineering attacks.
- **Organization Policy Reference**: Access comprehensive security policies and best practices.
- **Progress Tracking**: Monitor learning achievements and improvement areas.
- **Gamified Experience**: Earn achievements and gain experience points as you learn.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Groq LLM API (Llama 3 8B model)
- **Authentication**: JWT-based auth with secure password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (for production)
- Groq API key for chatbot functionality

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/humanlike-awarebot.git
   cd humanlike-awarebot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5000 in your browser.

### Deploying to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

## Project Structure

```
├── client/               # Frontend code
│   ├── src/              # React application
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── ...
├── server/               # Backend code
│   ├── services/         # Service modules (LLM, etc.)
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── ...
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and types
└── ...
```

## Academic Acknowledgements

This project was developed at Gannon University by:

- **Team Members**: Kalyankumar Konda, Baji Narra
- **Project Adviser**: Samuel Tweneboah-Koduah, Ph.D.

## License

This project is academic software and is not available for commercial use without permission.

## Acknowledgements

- Groq for providing the LLM API
- [List other acknowledgements here]