import { Telegraf, Markup } from 'telegraf';
import https from 'https';
import { config } from '../config/env.config';
import { updateActionStatus } from '../repo/mongo.repo';
import { logger } from '../utils/logger.util';

export const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN, {
    telegram: {
        agent: new https.Agent({ family: 4 })
    }
});

export async function sendDraftForApproval(text: string, dbId: string) {
    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Approve', `approve_${dbId}`),
        Markup.button.callback('Reject', `reject_${dbId}`)
    ]);
    
    await bot.telegram.sendMessage(config.TELEGRAM_CHAT_ID, `DRAFT TWEET:\n\n${text}`, keyboard);
}

// Global listener for button clicks
bot.on('callback_query', async (ctx) => {
    // @ts-ignore
    const data = ctx.callbackQuery.data;
    if (!data) return;
    
    const [action, dbId] = data.split('_');
    
    try {
        if (action === 'approve') {
            await updateActionStatus(dbId, 'approved');
            logger.info(`Received APPROVE for draft ${dbId}`);
            // @ts-ignore
            await ctx.editMessageText(`[APPROVED] Logged and ready for Twitter.\n\n${ctx.callbackQuery.message.text}`);
        } else if (action === 'reject') {
            await updateActionStatus(dbId, 'rejected');
            logger.info(`Received REJECT for draft ${dbId}`);
            // @ts-ignore
            await ctx.editMessageText(`[REJECTED] Discarded.\n\n${ctx.callbackQuery.message.text}`);
        }
        await ctx.answerCbQuery();
    } catch (error) {
        logger.error(`Error handling callback: ${error}`);
    }
});

// Launch bot polling in the background without blocking
bot.telegram.deleteWebhook().then(() => {
    bot.launch();
    logger.info('Telegram bot is listening via polling...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
