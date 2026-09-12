import { logger } from './logger.util';

export async function withRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error: any) {
            attempt++;
            if (attempt >= maxRetries) {
                logger.error(`[${operationName}] Failed after ${maxRetries} attempts.`);
                throw error;
            }
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            logger.warn(`[${operationName}] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Unreachable');
}
