const fs = require('fs');
const geoip = require('geoip-lite');

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

    loadProxyList(proxyListPath) {
        let pathToProxyList = proxyListPath !== undefined ? proxyListPath : __dirname + '/proxies.txt';
        // Read in the list of proxies from the text file and split by new line into array
        let rawProxyList = fs.readFileSync(pathToProxyList).toString().split(/\n/g);
        let emptyProxyList = [];
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