const {
    Page
} = require("puppeteer");
const {
    table
} = require('table');
const {
    parse
} = require('node-html-parser')
const fs = require('fs')

const csv = require('fast-csv');
const path = require('path');
const os = require("os");


/**
 * @param {Page} page - The page instance
 */
async function scrapeAll(page) {

    var binance_summaries = {}

    // Running Strategies
    await page.waitForSelector('div.css-1m9vq8i');

    const getMainStats = async () => {
        return await page.evaluate(async () => {
            const mainStats = [...document.querySelectorAll('div.css-1m9vq8i')];
            const refreshTime = document.querySelector('div.css-1yof1af').textContent.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)[0];
            return await new Promise(resolve => {
                resolve(
                    mainStats.map(element => {
                        return element.innerHTML.replace(/[^\d.]/g, '');
                    }).concat([refreshTime]));
            })
        })
    }

    const mainStats = await getMainStats();
    console.assert(mainStats.length === 3, 'mainStats.length === 3');

    binance_summaries['Active Strategies'] = mainStats[0];
    binance_summaries['Total Value'] = mainStats[1];
    binance_summaries['Refresh Time'] = mainStats[2];
    console.log(binance_summaries);

    const readStream = () => new Promise((resolve) => {
        fs.createReadStream(path.resolve('./', 'documents', 'binance_stats.csv'))
            .pipe(csv.parse({headers: true}))
            .validate(data => data['Refresh Time'] !== binance_summaries['Refresh Time'].trim())
            .on('error', error => console.error(error))
            .on('data', row => console.log(JSON.stringify(row)))
            .on('data-invalid', (row, rowNumber) => resolve(true))
            .on('end', rowCount => {
                console.log(`Parsed ${rowCount} rows`);
                resolve(false);
            });
    });

    readStream().then((duplicate_record) => {
        if (!duplicate_record) {
            let ws = fs.createWriteStream(path.resolve('./', 'documents', 'binance_stats.csv'), {flags: 'a'});
            ws.write(os.EOL);
            const csvStream = csv.format({headers: false, quote: false});
            csvStream.pipe(ws).on('end', () => process.exit());

            csvStream.write(mainStats);
            csvStream.end();
        }
    });
}

module.exports = scrapeAll;