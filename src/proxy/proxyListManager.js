const fs = require('fs');

let currentMainProxyList = fs.readFileSync('./proxies.txt').toString();

let newProxyList = fs.readFileSync('./proxies_to_ingest.txt').toString().split(/\n/g);

for (let proxy in newProxyList) {
    let proxyAddr = newProxyList[proxy];
    console.log(proxyAddr);
    console.log(currentMainProxyList.indexOf(proxyAddr));
    if (currentMainProxyList.indexOf(proxyAddr) === -1) {
        currentMainProxyList += "\n" + proxyAddr;
    }
}

fs.writeFileSync('./proxies.txt', currentMainProxyList);