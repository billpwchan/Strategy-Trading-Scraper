var config = {}

config.companies = {}

// Add a Company in here! 
config.companies.binance_trading_bot = {
    entryURL: 'https://www.binance.com/en/strategy/strategyPool?mode=default&strategyType=1',
    pageScraper: require('./controllers/binance_trading_bot')
}
config.companies.binance_spot_grid = {
    entryURL: 'https://www.binance.com/en/strategy/strategyPool?mode=pagination&strategyType=1',
    pageScraper: require('./controllers/binance_spot_grid')
}
config.companies.binance_futures_grid = {
    entryURL: 'https://www.binance.com/en/strategy/strategyPool?mode=pagination&strategyType=2',
    pageScraper: require('./controllers/binance_futures_grid')
}

Object.seal(config);


module.exports = config