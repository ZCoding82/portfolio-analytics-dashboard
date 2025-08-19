// Portfolio Analytics Dashboard - Main JavaScript

class PortfolioDashboard {
    constructor() {
        this.apiHandler = new APIHandler();
        this.chartManager = new ChartManager();
        this.portfolioData = {
            assets: [],
            totalValue: 0,
            dailyChange: 0,
            dailyPercentage: 0
        };
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.applyTheme();
        this.showLoading(true);
        
        try {
            await this.loadPortfolioData();
            this.updateDashboard();
            this.chartManager.initializeCharts();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to load portfolio data');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Refresh data
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });

        // Chart period buttons
        document.querySelectorAll('[data-period]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.changePeriod(e.target.dataset.period);
            });
        });

        // Asset search
        document.getElementById('asset-search').addEventListener('input', (e) => {
            this.filterAssets(e.target.value);
        });

        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.refreshData(true);
        }, 30000);
    }

    async loadPortfolioData() {
        try {
            // Sample portfolio assets - in a real app, this would come from user preferences
            const sampleAssets = ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink'];
            
            const assetData = await Promise.all(
                sampleAssets.map(async (asset) => {
                    const data = await this.apiHandler.getCryptoPrice(asset);
                    return {
                        id: asset,
                        name: data.name,
                        symbol: data.symbol.toUpperCase(),
                        price: data.current_price,
                        change24h: data.price_change_percentage_24h,
                        holdings: this.getRandomHoldings(), // Simulate holdings
                        value: 0 // Will be calculated
                    };
                })
            );

            // Calculate values
            assetData.forEach(asset => {
                asset.value = asset.holdings * asset.price;
            });

            this.portfolioData.assets = assetData;
            this.calculatePortfolioTotals();
            
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            // Fallback to demo data
            this.loadDemoData();
        }
    }

    getRandomHoldings() {
        // Simulate random holdings for demo purposes
        return Math.random() * 10 + 0.1;
    }

    loadDemoData() {
        // Demo data for when API fails
        this.portfolioData.assets = [
            {
                id: 'bitcoin',
                name: 'Bitcoin',
                symbol: 'BTC',
                price: 45000,
                change24h: 2.5,
                holdings: 0.5,
                value: 22500
            },
            {
                id: 'ethereum',
                name: 'Ethereum',
                symbol: 'ETH',
                price: 3200,
                change24h: -1.2,
                holdings: 2.0,
                value: 6400
            },
            {
                id: 'cardano',
                name: 'Cardano',
                symbol: 'ADA',
                price: 1.25,
                change24h: 5.8,
                holdings: 1000,
                value: 1250
            }
        ];
        this.calculatePortfolioTotals();
    }

    calculatePortfolioTotals() {
        this.portfolioData.totalValue = this.portfolioData.assets.reduce((sum, asset) => sum + asset.value, 0);
        
        // Calculate daily change
        let totalDailyChange = 0;
        this.portfolioData.assets.forEach(asset => {
            const previousValue = asset.value / (1 + asset.change24h / 100);
            totalDailyChange += asset.value - previousValue;
        });
        
        this.portfolioData.dailyChange = totalDailyChange;
        this.portfolioData.dailyPercentage = (totalDailyChange / (this.portfolioData.totalValue - totalDailyChange)) * 100;
    }

    updateDashboard() {
        this.updateStatsCards();
        this.updateAssetsTable();
        this.chartManager.updateCharts(this.portfolioData);
    }

    updateStatsCards() {
        // Total portfolio value
        document.getElementById('total-value').textContent = this.formatCurrency(this.portfolioData.totalValue);
        
        const totalChangeElement = document.getElementById('total-change');
        totalChangeElement.textContent = `${this.portfolioData.dailyPercentage >= 0 ? '+' : ''}${this.portfolioData.dailyPercentage.toFixed(2)}%`;
        totalChangeElement.className = `stat-change ${this.portfolioData.dailyPercentage >= 0 ? 'positive' : 'negative'}`;

        // Daily change
        document.getElementById('daily-change').textContent = this.formatCurrency(this.portfolioData.dailyChange);
        
        const dailyPercentageElement = document.getElementById('daily-percentage');
        dailyPercentageElement.textContent = `${this.portfolioData.dailyPercentage >= 0 ? '+' : ''}${this.portfolioData.dailyPercentage.toFixed(2)}%`;
        dailyPercentageElement.className = `stat-change ${this.portfolioData.dailyPercentage >= 0 ? 'positive' : 'negative'}`;

        // Active assets
        document.getElementById('active-assets').textContent = this.portfolioData.assets.length;

        // Best performer
        const bestPerformer = this.portfolioData.assets.reduce((best, asset) => 
            asset.change24h > best.change24h ? asset : best
        );
        document.getElementById('best-performer').textContent = bestPerformer.symbol;
        document.getElementById('best-performance').textContent = `+${bestPerformer.change24h.toFixed(2)}%`;
    }

    updateAssetsTable() {
        const tbody = document.getElementById('assets-tbody');
        tbody.innerHTML = '';

        this.portfolioData.assets.forEach(asset => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <strong>${asset.symbol}</strong>
                        <span style="color: var(--text-secondary); font-size: 0.875rem;">${asset.name}</span>
                    </div>
                </td>
                <td>${this.formatCurrency(asset.price)}</td>
                <td>
                    <span class="stat-change ${asset.change24h >= 0 ? 'positive' : 'negative'}">
                        ${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}%
                    </span>
                </td>
                <td>${asset.holdings.toFixed(4)} ${asset.symbol}</td>
                <td>${this.formatCurrency(asset.value)}</td>
                <td>
                    <button class="btn-secondary" onclick="dashboard.showAssetDetails('${asset.id}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterAssets(searchTerm) {
        const rows = document.querySelectorAll('#assets-tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    changePeriod(period) {
        // Update active button
        document.querySelectorAll('[data-period]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        // Update chart with new period
        this.chartManager.updatePeriod(period);
    }

    async refreshData(silent = false) {
        if (!silent) {
            this.showLoading(true);
        }

        try {
            await this.loadPortfolioData();
            this.updateDashboard();
            
            if (!silent) {
                this.showNotification('Portfolio data updated successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showNotification('Failed to refresh data', 'error');
        } finally {
            if (!silent) {
                this.showLoading(false);
            }
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.toggle('active', show);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showAssetDetails(assetId) {
        // This would open a modal or navigate to asset details
        console.log(`Showing details for ${assetId}`);
        this.showNotification(`Asset details for ${assetId} - Feature coming soon!`, 'info');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new PortfolioDashboard();
});

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    background: var(--success-color);
}

.notification-error {
    background: var(--danger-color);
}

.notification-info {
    background: var(--primary-color);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);