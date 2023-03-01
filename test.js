let unixTime = 1666888500000

let time = new Date(unixTime).toLocaleTimeString()
let date = new Date(unixTime).toLocaleDateString()
console.log(date, time)