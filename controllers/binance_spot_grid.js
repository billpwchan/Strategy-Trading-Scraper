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
const path = require("path");
const csv = require("fast-csv");
const os = require("os");


/**
 * @param {Page} page - The page instance
 */
async function scrapeAll(page) {

    var bots = []

    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler');

    await page.waitForSelector('button.css-fyte2i');


    const getPagination = async () => {
        return await page.evaluate(async () => {
            const elements = [...document.querySelectorAll('button.css-fyte2i')];
            return await new Promise(resolve => {
                resolve(elements[elements.length - 1].textContent);
            })
        })
    }

    const getRefreshTime = async () => {
        return await page.evaluate(async () => {
            return await new Promise(resolve => {
                resolve(document.querySelector('div.css-y28gn4').innerText.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)[0]);
            });
        });
    }

    totalPages = await getPagination();
    refreshTime = await getRefreshTime();

    let botCards;
    for (let index = 0; index < totalPages; index++) {
        await page.waitForSelector('div.css-mgjxuy');
        // Get All Job Cards from the page
        botCards = [];
        const getBotCards = async () => {
            return await page.evaluate(async () => {
                const elements = [...document.querySelectorAll('div.css-mgjxuy')].map(i => i.innerHTML);
                return await new Promise(resolve => {
                    resolve(elements);
                })
            })
        };
        botCards = await getBotCards();

        // Iterate all scrapped contents and save to the vacancies array
        botCards.forEach(botCard => {
            let botContent = {}
            const root = parse(botCard)
            botContent.cryptoPair = root.querySelector('div.css-1ld3mhe').childNodes[0].rawText
            botContent.copyPopularity = root.querySelector('div.css-1f9551p').innerText.match(/\d+/)[0];
            botContent.roi = root.querySelector('div.css-oogh8b').innerText
            botContent.pnl = root.querySelector('div.css-1dqzox3').innerText
            botContent.runningTime = root.querySelector('div.css-15u79n8').innerText
            bots.push(botContent)
        });

        // Go to next page (if available)
        await page.evaluate(() => {
            const elements = [...document.querySelectorAll('button.css-fyte2i')];
            const activeElementIndex = document.querySelector('button.css-192p1dx').innerText
            const nextElementIndex = Number(activeElementIndex) + 1;

            elements.some(function (element) {
                if (element.innerText === nextElementIndex.toString()) {
                    element.click();
                    return true;
                }
            });
        });
        await page.waitForTimeout(1000);
    }

    let writeStream = fs.createWriteStream(path.join('./', 'documents', 'Spot Grid', `binance_spot_grid_${refreshTime.replaceAll(':', '-')}.csv`));
    writeStream.write('cryptoPair,copyPopularity,roi,pnl,runningTime' + os.EOL);

    const csvStream = csv.format({headers: false, quote: false});
    csvStream.pipe(writeStream).on('end', () => process.exit());
    bots.forEach(bot => {
        csvStream.write(bot);
    });
    csvStream.end();

}

module.exports = scrapeAll;