# HumanLike-AwareBot: Social Engineering Awareness Training Platform

## About

HumanLike-AwareBot is a cutting-edge academic web application designed to enhance social engineering awareness through an interactive, gamified training platform powered by advanced AI technologies. This project is developed by Kalyankumar Konda and Baji Narra, under the guidance of project adviser Samuel Tweneboah-Koduah, Ph.D. at Gannon University.

## Key Features

- Interactive training modules with multiple difficulty levels
- Gamified chatbot scenarios powered by Groq LLM (Llama 3 8B)
- Progress tracking with XP points and achievements
- Social engineering threat awareness scenarios
- Organization policy management

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Groq API with Llama 3 8B

## Deployment to Vercel

To deploy this application to Vercel, follow these steps:

1. **Push to GitHub**:
   - Create a new GitHub repository
   - Push this code to the repository
   
2. **Connect to Vercel**:
   - Create a Vercel account at https://vercel.com
   - Click "New Project" and select your GitHub repository
   - Import the project
   
3. **Configure Environment Variables**:
   In the Vercel project settings, add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `GROQ_API_KEY`: Your Groq API key for LLM functionality
   - `SESSION_SECRET`: A random string for session encryption
   
4. **Deploy**:
   - Click "Deploy" and Vercel will automatically build and deploy your application

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: Groq API key for the chatbot
- `SESSION_SECRET`: Secret for encrypting session data

## Running Locally

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables in a `.env` file
4. Run database migrations with `npm run db:push`
5. Start the development server with `npm run dev`

## Acknowledgements

This project is developed as part of academic research at Gannon University, focusing on cybersecurity education and social engineering awareness.