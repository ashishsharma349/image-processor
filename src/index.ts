import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { fetchTrendingCoins } from './services/coingecko.service';
import { generateTweet } from './services/ai.service';
import { logAction, connectDB } from './repo/mongo.repo';
import { sendDraftForApproval, bot } from './bot/telegram.bot';
import { logger } from './utils/logger.util';
import { config } from './config/env.config';
import cron from 'node-cron';

// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});

async function runPipeline() {
    try {
        logger.info('Starting CryptoAgent MVP Pipeline...');
        
        // 1. Connect DB
        await connectDB();

        // 2. Fetch Data
        logger.info('Fetching market data...');
        const trending = await fetchTrendingCoins();
        if (trending.length === 0) {
            logger.error('No trending data found. Aborting.');
            return;
        }

        // 3. Generate Tweet
        logger.info('Generating tweet via OmniRoute...');
        const draft = await generateTweet(trending);
        if (!draft) {
            logger.error('Failed to generate draft. Aborting.');
            return;
        }

        // 4. Log to DB as Pending
        logger.info('Saving draft to MongoDB (pending)...');
        const dbId = await logAction('pending', draft.text, draft.tickers);

        // 5. Send to Telegram
        logger.info('Sending to Telegram for approval...');
        await sendDraftForApproval(draft.text, dbId);

        logger.info('Pipeline complete. Waiting for your Telegram button click!');
    } catch (error) {
        logger.error(`Pipeline failed: ${error}`);
    }
}

// Start cron scheduler
cron.schedule(config.CRON_SCHEDULE, () => {
    logger.info(`Cron triggered at ${new Date().toISOString()}`);
    runPipeline();
});

logger.info(`Scheduler started with cron: ${config.CRON_SCHEDULE}`);
// Run immediately on boot
runPipeline();

import express from 'express';

// Dummy Web Server for Hugging Face/Render Health Check
const app = express();
const port = process.env.PORT || 7860;
app.get('/', (req, res) => res.send('CryptoAgent MVP is Running!'));
app.listen(port, () => logger.info(`Dummy web server listening on port ${port}`));
