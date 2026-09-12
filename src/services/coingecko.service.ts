import { logger } from '../utils/logger.util';
import { withRetry } from '../utils/retry.util';

export async function fetchTrendingCoins() {
    try {
        return await withRetry('CoinGecko fetch', async () => {
            const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Extract top 3 trending coins
            return data.coins.slice(0, 3).map((item: any) => ({
                id: item.item.id,
                symbol: item.item.symbol,
                name: item.item.name,
                market_cap_rank: item.item.market_cap_rank
            }));
        }, 3, 2000); // 3 retries, starting at 2s
    } catch (error) {
        logger.error(`Failed to fetch trending coins: ${error}`);
        return [];
    }
}
