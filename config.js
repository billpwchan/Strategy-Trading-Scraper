var config = {}

config.companies = {}

// Add a Company in here! 
config.companies.binance_trading_bot = {
    entryURL: 'https://www.binance.com/en/strategy/strategyPool?mode=default&strategyType=1',
    pageScraper: require('./controllers/binance_trading_bot')

}

Object.seal(config);


module.exports = config