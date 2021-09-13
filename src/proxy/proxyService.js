const fs = require('fs');
const geoip = require('geoip-lite');
const request = require('request');

const HTTPService = require('../http/httpService');

class proxyService {

    /**
     * @param filters Object - the filters used to select which proxies to use.
     * e.g. {"region":"EU"}
     * e.g. {"country":"FR"}
     * e.g. {"city":"Bangkok"}
     *
     * @param validateProxies Bool - Whether or not the proxy list is to be validated
     */
    constructor(filters, validateProxies, randomProxySelection, debug) {
        this.filters = filters !== undefined ? filters : undefined;
        this.validateProxies = validateProxies;
        this.proxyList = [];
        this.currentPosition = 0;

        this.randomProxySelection = randomProxySelection;

        this.validatedProxyExists = false;

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

        request.get('https://www.proxynova.com/proxy-server-list/elite-proxies/', (err, resp, body) => {
            if (!err) {
                let transformedBody = this.customHTMLProxyListHandler(body, {
                    firstSplitter: 'write',
                    secondSplitter: '\\n\\n'
                });

                this.addProxiesToLocalList(err, resp, transformedBody);
            }
        });

        request.get('https://www.proxy-list.download/api/v0/get?l=en&t=http', (err, resp, body) => {

            if (!err) {
                let ipList = JSON.parse(body)[0].LISTA;
                let transformedProxyContent = "";

                for (let item in ipList) {
                    let IPInfo = ipList[item];

                    if (IPInfo.ANON === "Anonymous" || IPInfo.ANON === "Elite") {
                        transformedProxyContent += IPInfo.IP + ":" + IPInfo.PORT + "\n";
                    }
                }

                this.addProxiesToLocalList(err, resp, transformedProxyContent);
            }
        });
    }

    // Hacky AF but should do the trick.... Split up an HTML body (usually for when proxies are returned inside
    // an HTML <table> el....).
    customHTMLProxyListHandler(body, splitters) {
        if (body) {
            let transformedProxyContent = "";

            let firstSplitRegexp = new RegExp(splitters.firstSplitter, 'g');
            let initialSplitOnBody = body.split(firstSplitRegexp);

            for (let chunk in initialSplitOnBody) {

                let chunkContainsIP = initialSplitOnBody[chunk].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/);

                if (chunkContainsIP && chunk != 0) {
                    let secondSplitRegexp = new RegExp(splitters.secondSplitter, 'g');
                    let secondSplitOnChunk = initialSplitOnBody[chunk].split(secondSplitRegexp);

                    let port = secondSplitOnChunk[0].match(/[0-9]{4,5}/);

                    transformedProxyContent += chunkContainsIP + ":" + port + "\n";

                }
            }
        }

        return "";
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

        this.debugStatement('loadProxyList', 'Reading in proxies from file: ' + pathToProxyList);

        // Read in the list of proxies from the text file and split by new line into array
        let rawProxyList = fs.readFileSync(pathToProxyList).toString().split(/\n/g);
        let mainProxyList = [];

        let secondaryProxyList = [];

        this.debugStatement('loadProxyList', 'Read ' + rawProxyList.length + ' proxies in from disk.');

        for (let proxyAddress in rawProxyList) {
            // split out port from IP to decorate the proxy for filtering later on
            let newProxyGeoData = this.loadGeoIpData(rawProxyList[proxyAddress].split(':')[0]);
            let newProxyObject = {
                'address': rawProxyList[proxyAddress],
                'currentRequestCount': 0,
                'isWorking': true,
                'hasBeenTested': false,
                'geoData': newProxyGeoData
            }

            // Test new IP against the current filters
            if (this.testProxyAgainstFilter(newProxyGeoData) && newProxyObject.address !== "") {
                mainProxyList.push(newProxyObject);
            } else if (this.testProxyAgainstFilter(newProxyGeoData) === false && newProxyObject.address !== "") {
                // Add proxy to secondary list if it does not match filters.. To be used in future versions...
                secondaryProxyList.push(newProxyObject);
            }

        }

        this.debugStatement('loadProxyList', 'Loaded ' + mainProxyList.length + ' proxies.');
        this.proxyList = mainProxyList;
        this.secondaryProxyList = secondaryProxyList;

        return mainProxyList;
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
            let latLong = geoip.lookup(ip).ll ? geoip.lookup(ip).ll : "unknown";
            let timezone = geoip.lookup(ip).timezone ? geoip.lookup(ip).timezone : "unknown";


            return {
                'country': countryCode,
                'region': region,
                'city': city,
                'latLong': latLong,
                'timezone': timezone
            };

        } else {
            return {};
        }
    }

    fetchNextProxy() {
        if (this.randomProxySelection === true) {
            this.debugStatement('fetchNextProxy', 'Selecting random proxy to use.');
            this.currentPosition = this.proxyList[Math.floor(Math.random() * this.proxyList.length)] - 1;
        }

        // Test to make sure we are not at the end of the proxyList
        if (this.currentPosition < this.proxyList.length - 1) {
            this.currentPosition++;
        } else {
            this.currentPosition = 0;
        }

        if (this.validateProxies === true && this.validatedProxyExists === true) {
            while (this.proxyList[this.currentPosition].isWorking !== true || this.proxyList[this.currentPosition].hasBeenTested !== true) {
                if (this.currentPosition < this.proxyList.length - 1) {
                    this.currentPosition++;
                } else {
                    this.currentPosition = 0;
                }
            }

        }

        // Increment the count of usages for this IP
        this.proxyList[this.currentPosition].currentRequestCount++;

        // Return latest version of the proxy config
        return this.proxyList[this.currentPosition];
    }

    // This fn is called after a proxy list has been loaded. It will run through all the loaded proxies
    // and test whether or not they do in fact work.
    // triggered by a "validateProxies:true" flag on creton creation
    // has the ability to read in a custom domain + path + method and to test
    // Object format {secure: false, endpoint:"domain.com/path", method:"GET"}
    testLoadedProxyList(proxyValidationConfiguration) {

        let parsedProxyValidationConfig = proxyValidationConfiguration !== undefined ? proxyValidationConfiguration : {};

        let endpointAndMethodToTest = {
            secure: parsedProxyValidationConfig.secure !== undefined ? parsedProxyValidationConfig.secure : false,
            endpoint: parsedProxyValidationConfig.endpoint !== undefined ? parsedProxyValidationConfig.endpoint : "www.example.com/",
            method: parsedProxyValidationConfig.method !== undefined ? parsedProxyValidationConfig.method : "GET",
            expectedStatusCode: parsedProxyValidationConfig.expectedStatusCode !== undefined ? parsedProxyValidationConfig.expectedStatusCode : 200
        };

        // maxProxyLatency defaults to 20seconds
        let maxProxyLatency = parsedProxyValidationConfig.maxLatency !== undefined ? parsedProxyValidationConfig.maxLatency : 20000;

        this.debugStatement('testLoadedProxyList', 'endpointConfig : ' + JSON.stringify(endpointAndMethodToTest));

        for (let proxy in this.proxyList) {
            let proxyDetails = this.proxyList[proxy];
            this.debugStatement('testLoadedProxyList', 'Validating: ' + proxyDetails.address);
            // Setup the HTTP client with the new proxy info
            let httpClient = new HTTPService(proxyDetails.address, false, 'false');

            let urlToRequest = endpointAndMethodToTest.secure === true ? 'https://' + endpointAndMethodToTest.endpoint : 'http://' + endpointAndMethodToTest.endpoint;

            httpClient.setOptionsForFirstRequest(urlToRequest, endpointAndMethodToTest.method);

            // write the data into the http client to be used at validation post response
            httpClient.JSONDataStore.set('proxyPos', proxy);
            httpClient.JSONDataStore.set('expectedStatusCode', endpointAndMethodToTest.expectedStatusCode);
            httpClient.JSONDataStore.set('maxProxyLatency', maxProxyLatency);

            // Set time for initial request - this will help us map latency across proxies.
            httpClient.JSONDataStore.set('requestSendTime', Date.now());


            httpClient.sendHTTPRequest((err, resp, body, httpClient) => {
                this.proxyTestCallback(err, resp, body, httpClient)
            });

        }
    }

    proxyTestCallback(err, resp, body, httpClient) {
        let proxyPos = httpClient.JSONDataStore.get('proxyPos');
        let expectedHTTPStatusCode = httpClient.JSONDataStore.get('expectedStatusCode');

        let maxProxyLatency = httpClient.JSONDataStore.get('maxProxyLatency');

        let requestSendTime = httpClient.JSONDataStore.get('requestSendTime');
        let requestLatency = Date.now() - requestSendTime;

        if (err || resp.statusCode !== expectedHTTPStatusCode || requestLatency > maxProxyLatency) {
            this.proxyList[proxyPos].isWorking = false;
            this.proxyList[proxyPos].hasBeenTested = true;
        } else {
            this.debugStatement('proxyTestCallback', this.proxyList[proxyPos].address + ' is working.');
            this.proxyList[proxyPos].isWorking = true;
            this.proxyList[proxyPos].hasBeenTested = true;

            // Store the roundtrip latency in ms
            this.proxyList[proxyPos].initialLatency = requestLatency;
            this.validatedProxyExists = true;
        }
    }

    /**
     * This function enables you to access the current list of proxies that your Creton instance will be using.
     * This will return an object that contains two arrays, one for "unverified" proxies and one for "verified" proxies
     *
     * return {Object} => verified: [], unverified: []
     */
    getListOfProxies() {

        let proxyList = {
            verified: [],
            unverified: []
        };

        for (let proxyID in this.proxyList) {
            let currentProxy = this.proxyList[proxyID];
            if (currentProxy.hasBeenTested === true && currentProxy.isWorking === true) {
                proxyList.verified.push(currentProxy);
            } else {
                proxyList.unverified.push(currentProxy);
            }
        }

        return proxyList;
    }

    debugStatement(fn, message) {
        if (this.debug === true) {
            console.log('[ proxyService.' + fn + ' ] : ' + message);
        }

        return null;
    }
}

module.exports = proxyService;