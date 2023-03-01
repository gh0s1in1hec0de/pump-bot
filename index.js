import Binance from 'binance-api-node';
//todo figure out how to sort coins basing on its usd volume

const baseURL = 'https://api.binance.com/api/v3/exchangeInfo'
const client = Binance.default({
    apiKey: '',
    apiSecret: '',
});
let exchangeInfo
let tickers = []
let quoteAssets = ['BTC', 'ETH', 'USDT', 'BUSD', 'BNB', 'XRP', 'USDC']

//getting the data from the server
exchangeInfo = await fuckingRequest(baseURL)

// taking all the tickers inna one array
for (let i = 0; i < exchangeInfo.symbols.length; i++) {
    if (exchangeInfo.symbols[i].status === 'TRADING') tickers.push(exchangeInfo.symbols[i].symbol)
}
// let candles = await client.candles({
//     symbol: 'BTCUSDT',
//     interval: '5m'
// })
//
// console.log(candles)

//so we got all the pairs and now we sort it out by volume and check the increases
for (let i = 0; i < tickers.length; i++){

      //the first part is sorting out the pairs
    let symbol = tickers[i]
    let quoteAsset = tickers[i][tickers[i].length - 3] + tickers[i][tickers[i].length - 2] + tickers[i][tickers[i].length - 1]

   // just making clear with quote assets' ticker
    if (quoteAsset === 'SDT') quoteAsset = 'USDT'
    else if (quoteAsset === 'SDC') quoteAsset = 'USDC'
    else if (quoteAsset === 'USD') quoteAsset = tickers[i][tickers[i].length - 4] + tickers[i][tickers[i].length - 3] + tickers[i][tickers[i].length - 2] + tickers[i][tickers[i].length - 1]

     //second part is analyse of the volume
    if (quoteAssets.indexOf(quoteAsset) !== -1) {

        let dollarVol;
        let candles4h = await client.candles({
            symbol: symbol,
            interval: '4h'
        })

        let candles5m = await client.candles({
            symbol: symbol,
            interval: '5m'
        })

        if (quoteAsset === 'USDT') {
            dollarVol = Math.floor(candles4h[candles4h.length - 1].quoteVolume)
        } else {
            let quoteVol = candles4h[candles4h.length - 1].quoteVolume
            let quoteSymbol = quoteAsset + 'USDT'
            let quoteCandles4h = await client.candles({
                symbol: quoteSymbol,
                interval: '4h'
            })
            dollarVol = Math.floor(quoteVol * quoteCandles4h[quoteCandles4h.length - 1].close)
        }

        if (dollarVol > 350000) {  // throw out deadcoins
            console.log(symbol, dollarVol + ' $' + '\n')
            volumeCheck(candles4h, tickers[i])
            quickChangeCheck(candles5m, tickers[i])
        } else {
            console.log(tickers[i])
        }
    }
}


// end of logic, only functions next
async function fuckingRequest(URL) {
    console.log(`fat mom here: ${URL}`)
    const response = await fetch(URL)
    const data = await response.json()
    return data
}

function volumeCheck(candles, ticker) {
    let throwingRange = 1
    let ratios = []
    let currentCandleTime = new Date(candles[candles.length - 1].openTime).toLocaleTimeString()
    let currentCandleDate = new Date(candles[candles.length - 1].openTime).toLocaleDateString()

    for (let i = 1; i <= throwingRange; i++) {
        let thisCandleTime = new Date(candles[candles.length - (1 + i)].openTime).toLocaleTimeString()
        let thisCandleDate = new Date(candles[candles.length - (1 + i)].openTime).toLocaleDateString()
        let ratio = (candles[candles.length - 1].volume - candles[candles.length - (1 + i)].volume) /  (candles[candles.length - (1 + i)].volume)
        ratios.push(ratio)

        if (ratio > 3) {
            console.log(`4h volume ve been raised on ${ticker} in ${ratio} times`)
        }
    }
}

function quickChangeCheck(candles, ticker) {
    let curPriseClose = candles[candles.length - 1].close
    let prevPriseClose = candles[candles.length - 2].close
    let difference = Math.abs((curPriseClose / prevPriseClose) * 100 - 100)

    if (difference > 1) {
        console.log(`Price changed on ${difference} percents on ${ticker}`)
    }
}




