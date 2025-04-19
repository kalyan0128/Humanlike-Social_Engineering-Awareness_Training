# Deploying HumanLike-AwareBot to Vercel via GitHub

This guide will walk you through the process of deploying your HumanLike-AwareBot application to Vercel using GitHub.

## Prerequisites

1. [GitHub](https://github.com/) account
2. [Vercel](https://vercel.com/) account
3. [PostgreSQL](https://neon.tech/) database (we recommend Neon.tech for serverless PostgreSQL)
4. [Groq API](https://console.groq.com/) key

## Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name your repository (e.g., "humanlike-awarebot")
   - Set it to public or private as preferred
   - Click "Create repository"

2. Initialize and push your local repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/humanlike-awarebot.git
   git push -u origin main
   ```

## Step 2: Set Up a PostgreSQL Database

1. Create a PostgreSQL database on Neon.tech or any other provider:
   - Sign up at https://neon.tech/
   - Create a new project
   - Create a database
   - Get your connection string (`postgresql://username:password@host:port/database`)

## Step 3: Deploy on Vercel

1. Sign up or log in to Vercel:
   - Go to https://vercel.com/

2. Import your GitHub repository:
   - Click "Add New..." -> "Project"
   - Connect to GitHub and select your repository
   - Click "Import"

3. Configure project settings:
   - Project Name: humanlike-awarebot (or your preferred name)
   - Framework Preset: Leave as "Other"
   - Build and Output Settings: Leave as default (they'll be pulled from vercel.json)
   - Environment Variables: Add the following variables:
     * `DATABASE_URL`: Your PostgreSQL connection string
     * `GROQ_API_KEY`: Your Groq API key
     * `SESSION_SECRET`: A random string for session encryption (you can generate one at https://1password.com/password-generator/)
     * `NODE_ENV`: Set to "production"

4. Click "Deploy"

5. Vercel will build and deploy your application. Once completed, you'll get a deployment URL.

## Step 4: Database Setup

After deployment, you need to set up your database schema:

1. Open the Vercel deployment logs to monitor the database migration:
   - In your Vercel dashboard, go to your project
   - Click on the latest deployment
   - Go to "Functions" or "Logs" tab to see deployment logs
   - The database schema should be automatically created during the build process via the `db:push` command

2. If you need to manually run migrations or add seed data:
   - Use Vercel CLI to run commands against your production environment

## Step 5: Verify Deployment

1. Visit your deployed application URL
2. Test the application functionality:
   - Login/signup
   - View training modules
   - Complete quizzes
   - View threat scenarios
   - Interact with the chatbot

## Troubleshooting

If you encounter any issues during deployment:

1. Check Vercel deployment logs for errors
2. Verify that all environment variables are set correctly
3. Ensure your database is accessible from Vercel's servers
4. Check that your GROQ API key is valid and has sufficient quota

## Custom Domain Setup (Optional)

1. Purchase a domain from a registrar (e.g., Namecheap, GoDaddy)
2. In your Vercel project:
   - Go to "Settings" -> "Domains"
   - Add your custom domain
   - Follow Vercel's instructions to set up DNS records with your domain registrar

## Continuous Deployment

Vercel automatically deploys your application when you push changes to your GitHub repository. To make updates:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel will automatically detect the push and deploy the updated application

## Important Notes

1. Keep your environment variables secure and never commit them to your repository
2. For database changes, be cautious with schema migrations in production
3. Monitor your Groq API usage to prevent unexpected charges