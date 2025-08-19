// API Handler for Portfolio Analytics Dashboard

class APIHandler {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getCryptoPrice(coinId) {
        const cacheKey = `price_${coinId}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const processedData = {
                id: data.id,
                name: data.name,
                symbol: data.symbol,
                current_price: data.market_data.current_price.usd,
                price_change_percentage_24h: data.market_data.price_change_percentage_24h,
                market_cap: data.market_data.market_cap.usd,
                total_volume: data.market_data.total_volume.usd
            };
            
            this.cache.set(cacheKey, {
                data: processedData,
                timestamp: Date.now()
            });
            
            return processedData;
        } catch (error) {
            console.error(`Error fetching data for ${coinId}:`, error);
            throw error;
        }
    }

    async getMultipleCryptoPrices(coinIds) {
        const promises = coinIds.map(id => this.getCryptoPrice(id));
        return Promise.all(promises);
    }

    async getHistoricalData(coinId, days = 7) {
        const cacheKey = `history_${coinId}_${days}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching historical data for ${coinId}:`, error);
            throw error;
        }
    }
}