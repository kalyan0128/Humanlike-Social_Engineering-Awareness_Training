import crypto from 'crypto';

console.log('\n========= ENVIRONMENT VARIABLES FOR VERCEL DEPLOYMENT =========\n');

// Values you already have
console.log('DATABASE_URL:');
console.log('Your PostgreSQL URL: postgresql://postgres:Kalyan%4024@localhost:5432/Humanlike-Social_Engineering-Awareness_Training');
console.log('Note: For production, you may need to update this URL if your database is hosted elsewhere');
console.log('\n');

console.log('GROQ_API_KEY:');
console.log('Your Groq API Key: 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');
console.log('\n');

// Generate JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n');

// Generate SESSION_SECRET
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('\n');

// Simple values
console.log('NODE_ENV:');
console.log('production');
console.log('\n');

console.log('VERCEL:');
console.log('1');
console.log('\n');

console.log('========= COPY THESE VALUES TO VERCEL ENVIRONMENT VARIABLES =========\n');