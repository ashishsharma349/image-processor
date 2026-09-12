import dotenv from 'dotenv';
dotenv.config();

export const config = {
    MONGO_URI: process.env.MONGO_URI || '',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
    AI_API_URL: process.env.AI_API_URL || 'http://127.0.0.1:20128/v1',
    AI_API_KEY: process.env.AI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'my-combo',
    ACCOUNT_ID: process.env.ACCOUNT_ID || 'crypto_agent_01',
    SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || 'You are a crypto expert.',
    CRON_SCHEDULE: process.env.CRON_SCHEDULE || '*/3 * * * *',
};

// Fail fast
for (const [key, value] of Object.entries(config)) {
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
}
