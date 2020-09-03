const fs = require('fs');
const geoip = require('geoip-lite');
const request = require('request');

class proxyService {

    /**
     * @param filters Object - the filters used to select which proxies to use.
     * e.g. {"region":"EU"}
     * e.g. {"country":"FR"}
     * e.g. {"city":"Bangkok"}
     */
    constructor(filters, debug) {
        this.filters = filters !== undefined ? filters : {};
        this.proxyList = [];
        this.currentPosition = 0;
        this.debug = debug;
    }

    /**
     * Pulls the latest public, free proxy lists into the CretonJS client.
     *
     * This will write them to disk in a local file called `proxies.txt`. Currently uses three public proxy sources... This will be expanded in the future.
     */
    getLatestProxyLists() {
        this.debugStatement('getLatestProxyLists', 'Fetching new lists.');
        request.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', (err, resp, body) => {
            this.addProxiesToLocalList(err, resp, body);
        });
        request.get('https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&ssl=yes', (err, resp, body) => {
            this.addProxiesToLocalList(err, resp, body);
        });
        request.get('https://www.proxy-list.download/api/v1/get?type=https&anon=elite', (err, resp, body) => {
            this.addProxiesToLocalList(err, resp, body);
        });
        request.get('https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt', (err, resp, body) => {
            this.addProxiesToLocalList(err, resp, body);
        });
    }


    addProxiesToLocalList(error, response, body) {
        if (!error) {
            let proxyList = body.replace(/\r/g, '').split('\n');
            let currentLocalProxyList;

            let proxyFilePath = __dirname + '/proxies.txt';
            if (!fs.existsSync(proxyFilePath)) {

                this.debugStatement('addProxiesToLocalList', 'Creating new proxy file @ ' + proxyFilePath);

                fs.closeSync(fs.openSync(proxyFilePath, 'w'));
                currentLocalProxyList = '';
            } else {
                currentLocalProxyList = fs.readFileSync(proxyFilePath).toString();
            }

            let newProxiesAdded = 0;

            for (let item in proxyList) {
                if ((proxyList[item].match(/\./g) || []).length === 3 && (currentLocalProxyList.indexOf(proxyList[item]) === -1)) {
                    fs.appendFileSync(proxyFilePath, proxyList[item] + '\n');
                    newProxiesAdded++;
                }
            }

            this.debugStatement('addProxiesToLocalList', 'Added ' + newProxiesAdded + ' new proxies from list.');
        }
    }

    loadProxyList(proxyListPath) {
        let pathToProxyList = proxyListPath !== undefined ? proxyListPath : __dirname + '/proxies.txt';

        this.debugStatement('loadProxyList', 'Reading proxies from: ' + pathToProxyList);

        // Read in the list of proxies from the text file and split by new line into array
        let rawProxyList = fs.readFileSync(pathToProxyList).toString().split(/\n/g);
        let emptyProxyList = [];

        this.debugStatement('loadProxyList', 'Read ' + rawProxyList.length + ' proxies in from disk.');

        for (let proxyAddress in rawProxyList) {
            // split out port from IP to decorate the proxy for filtering later on
            let newProxyGeoData = this.loadGeoIpData(rawProxyList[proxyAddress].split(':')[0]);
            let newProxyObject = {
                'address': rawProxyList[proxyAddress],
                'currentRequestCount': 0,
                'isWorking': true,
                'geoData': newProxyGeoData
            }

            // Test new IP against the current filters
            if (this.testProxyAgainstFilter(newProxyGeoData)) {
                emptyProxyList.push(newProxyObject);
            }

        }

        this.debugStatement('loadProxyList', 'Loaded ' + emptyProxyList.length + ' proxies.');
        this.proxyList = emptyProxyList;
        return emptyProxyList;
    }

    testProxyAgainstFilter(geoData) {

        if (!this.filters) return true;

        return this.filters.city === geoData.city ||
            this.filters.country === geoData.country ||
            this.filters.region === geoData.region;

    }

    loadGeoIpData(ip) {
        if (geoip.lookup(ip)) {

            let countryCode = geoip.lookup(ip).country ? geoip.lookup(ip).country : "unknown";
            let region = geoip.lookup(ip).region ? geoip.lookup(ip).region : "unknown";
            let city = geoip.lookup(ip).city ? geoip.lookup(ip).city : "unknown";
            let timezone = geoip.lookup(ip).timezone ? geoip.lookup(ip).timezone : "unknown";


            return {
                'country': countryCode,
                'region': region,
                'city': city,
                'timezone': timezone
            };

        } else {
            return {};
        }
    }

    fetchNextProxy() {
        if (this.currentPosition < this.proxyList.length) {
            this.currentPosition++;
        } else {
            this.currentPosition = 0;
        }

        // Increment the count of usages for this IP
        this.proxyList[this.currentPosition].currentRequestCount++;

        // Return latest version of the proxy config
        return this.proxyList[this.currentPosition];
    }

    debugStatement(fn, message) {
        if (this.debug === true) {
            console.log('[ proxyService.' + fn + ' ] : ' + message);
        }

        return null;
    }
}

module.exports = proxyService;