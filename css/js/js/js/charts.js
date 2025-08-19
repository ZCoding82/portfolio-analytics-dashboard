// Chart Manager for Portfolio Analytics Dashboard

class ChartManager {
    constructor() {
        this.portfolioChart = null;
        this.allocationChart = null;
        this.currentPeriod = '24h';
    }

    initializeCharts() {
        this.createPortfolioChart();
        this.createAllocationChart();
    }

    createPortfolioChart() {
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        
        this.portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Portfolio Value',
                    data: this.generateSampleData(),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    createAllocationChart() {
        const ctx = document.getElementById('allocationChart').getContext('2d');
        
        this.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bitcoin', 'Ethereum', 'Cardano', 'Polkadot', 'Chainlink'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#f7931a',
                        '#627eea',
                        '#0033ad',
                        '#e6007a',
                        '#375bd2'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    updateCharts(portfolioData) {
        this.updateAllocationChart(portfolioData);
        // Portfolio chart would be updated with real historical data
    }

    updateAllocationChart(portfolioData) {
        if (!this.allocationChart || !portfolioData.assets) return;
        
        const labels = portfolioData.assets.map(asset => asset.name);
        const data = portfolioData.assets.map(asset => asset.value);
        const colors = this.generateColors(portfolioData.assets.length);
        
        this.allocationChart.data.labels = labels;
        this.allocationChart.data.datasets[0].data = data;
        this.allocationChart.data.datasets[0].backgroundColor = colors;
        this.allocationChart.update();
    }

    updatePeriod(period) {
        this.currentPeriod = period;
        // Update portfolio chart with new time period
        this.portfolioChart.data.labels = this.generateTimeLabels();
        this.portfolioChart.data.datasets[0].data = this.generateSampleData();
        this.portfolioChart.update();
    }

    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        let points = 24;
        let interval = 'hour';
        
        switch(this.currentPeriod) {
            case '24h':
                points = 24;
                interval = 'hour';
                break;
            case '7d':
                points = 7;
                interval = 'day';
                break;
            case '30d':
                points = 30;
                interval = 'day';
                break;
            case '1y':
                points = 12;
                interval = 'month';
                break;
        }
        
        for (let i = points - 1; i >= 0; i--) {
            const date = new Date(now);
            if (interval === 'hour') {
                date.setHours(date.getHours() - i);
                labels.push(date.getHours() + ':00');
            } else if (interval === 'day') {
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else if (interval === 'month') {
                date.setMonth(date.getMonth() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            }
        }
        
        return labels;
    }

    generateSampleData() {
        const baseValue = 30000;
        const data = [];
        let currentValue = baseValue;
        
        for (let i = 0; i < this.generateTimeLabels().length; i++) {
            const change = (Math.random() - 0.5) * 2000;
            currentValue += change;
            data.push(Math.max(currentValue, baseValue * 0.8));
        }
        
        return data;
    }

    generateColors(count) {
        const colors = [
            '#f7931a', '#627eea', '#0033ad', '#e6007a', '#375bd2',
            '#00d4aa', '#ff6b35', '#f7dc6f', '#bb8fce', '#85c1e9'
        ];
        return colors.slice(0, count);
    }
}