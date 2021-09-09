const HttpsProxyAgent = require('https-proxy-agent');
const request = require('request');

class httpService {
    constructor(proxy, stickySessions, debug) {
        this.debug = debug;
        this.stickySessions = stickySessions;
        this.proxy = this.setHTTPProxy(proxy);

        this.JSONDataStore = this.internalDataStoreHandler();
    }

    setHTTPProxy(proxyAddress) {
        let proxy = `http://${proxyAddress}`;
        this.debugStatement('setHTTPProxy', 'Proxy set to ' + proxy);
        return new HttpsProxyAgent(proxy);
    }

    /**
     *
     * @param uri - String . e.g https://website.com/path
     * @param method - String - HTTP Method
     * @param body - HTTPBodyData - HTTP Body data (IF POST)
     * @returns {{headers: *, agent: createHttpsProxyAgent | HttpsProxyAgent, method: *, followRedirect: boolean, uri: *, timeout: number, maxRedirects: number}}
     */
    setOptionsForFirstRequest(uri, method, HTTPBodyData) {
        this.options = {
            uri: uri,
            method: method,
            headers: this.generateRandomHTTPHeaders(uri),
            agent: this.proxy,
            timeout: 5000,
            followRedirect: true,
            maxRedirects: 10,
            gzip: true
        }

        // Handle content-type header ONLY if we are sending data
        if (HTTPBodyData !== undefined) {
            this.options.body = HTTPBodyData.bodyContent;
            this.options.headers['Content-Type'] = HTTPBodyData.bodyType;
        }


        this.debugStatement('setOptionsForNextRequest', 'Request options set');
        return this.options;

    }

    /**
     *
     * @param uri - String . e.g https://website.com/path
     * @param method - String - HTTP Method
     * @param HTTPBodyData - Object - HTTP Body Data (IF POST)
     * @returns {{headers: *, agent: createHttpsProxyAgent | HttpsProxyAgent, method: *, followRedirect: boolean, uri: *, timeout: number, maxRedirects: number}}
     */
    updateRequestOptionsForNextRequest(uri, method, HTTPBodyData) {
        this.options.uri = uri;
        this.options.method = method;

        if (HTTPBodyData !== undefined) {
            this.options.body = HTTPBodyData.bodyContent;
            this.options.headers['Content-Type'] = HTTPBodyData.bodyType;
        }


        this.debugStatement('updateRequestOptionsForNextRequest', 'Request options updated.');

        return this.options;
    }

    /**
     *
     * @param uri String - the URI the HTTP request is being sent to. e.g. https://www.example.com
     * @returns {{}}
     */
    generateRandomHTTPHeaders(uri) {
        let headerTemplate = [
            {'User-Agent': this.getRandomUserAgent()},
            {'Connection': 'keep-alive'},
            {'Accept': 'text/html'},
            {'Accept-Encoding': 'gzip'},
            {'Sec-Fetch-Site': 'same-origin'},
            {'Sec-Fetch-Mode': 'cors'},
            {'Accept-Language': this.getRandomAcceptLanguageHeader()},
            {'Cache-Control': 'max-age=0'},
            {'Cookie': this.generateRandomCookies()},
            {'Referer': uri},
        ];

        this.debugStatement('generateRandomHTTPHeaders', 'HTTP Headers generated');

        let newHeaderObject = {};
        for (let headers in headerTemplate) {

            let pos = Math.floor(Math.random() * headerTemplate.length)
            let nextHeaderToAdd = headerTemplate[pos];
            newHeaderObject[Object.keys(nextHeaderToAdd)[0]] = nextHeaderToAdd[Object.keys(nextHeaderToAdd)[0]];

            headerTemplate[pos] = undefined;

            headerTemplate = headerTemplate.filter(function (val) {
                return Boolean(val);
            });
        }
        this.debugStatement('generateRandomHTTPHeaders', 'Headers randomized');
        this.debugStatement('generateRandomHTTPHeaders', 'Header Values: ' + JSON.stringify(newHeaderObject));

        return newHeaderObject;

    }

    generateRandomCookies() {
        this.debugStatement('generateRandomCookies', 'Generating random cookies');

        let cookieTemplate = [
            {"_ga": this.generateGACookieValues()},
            {"_gid": this.generateGACookieValues()}
        ];
        this.debugStatement('generateRandomCookies', 'Cookie values generated');

        let newCookieString = "";
        for (let cookie in cookieTemplate) {

            let pos = Math.floor(Math.random() * cookieTemplate.length)
            let nextCookieToAdd = cookieTemplate[pos];
            newCookieString += Object.keys(nextCookieToAdd)[0] + '=' + nextCookieToAdd[Object.keys(nextCookieToAdd)[0]] + ";";

            cookieTemplate[pos] = undefined;

            cookieTemplate = cookieTemplate.filter(function (val) {
                return Boolean(val);
            });
        }

        return newCookieString;

    }

    generateGACookieValues() {
        let tenDigitNumber = Math.floor(1000000000 + Math.random() * 9000000000);
        let elevenDigitNumber = Math.floor(10000000000 + Math.random() * 90000000000);
        let baseGACookieValueTemplate = "GA1.2." + elevenDigitNumber + "." + tenDigitNumber;

        return baseGACookieValueTemplate;
    }

    getRandomAcceptLanguageHeader() {
        const acceptLangs = [
            "de",
            "de-CH",
            "en-US,en;q=0.5",
            "fr-CH",
            "en-US,fr-CA",
            "en-US,en;q=0.9",
            "da, en-GB;q=0.8, en;q=0.7",
            "en-GB",
            "en-US,en;q=0.9"
        ];

        return acceptLangs[Math.floor(Math.random() * acceptLangs.length)];
    }

    /**
     * Generates a random user agent string.
     * Currently uses 3 basic templates. Chrome OSX, Chrome Windows, iOS Safari. Will add to this as time goes on.
     * @returns {string}
     */
    getRandomUserAgent() {

        let generateNumberBetweenTwoNumbers = function (min, max) {
            return Math.floor(Math.random() * max) + min;
        }

        let generateVersionNumber = function (length) {
            // Hacky but works well enough...
            return Math.floor(Math.random() * 10000000000 + 1).toString().slice(0, length)
        }

        let chooseItemFromArray = function (array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        let generatedBrowserData = {
            IOS_VERSION: [`${chooseItemFromArray(['10', '11', '12', '13', '14'])}_${generateVersionNumber(1)}`],
            SAFARI_BUILD_IDS: ['15E148', '15A5370a', '16A366'],
            SAFARI_IOS_VERSIONS: [`${chooseItemFromArray(['10', '11', '12', '13', '14'])}.${generateVersionNumber(1)}.${generateVersionNumber(1)}`],
            WEBKIT_VERSION: ["537.36", `60${chooseItemFromArray(['4', '5'])}.1.${generateVersionNumber(2)}`],
            CHROME_VERSION: [`${chooseItemFromArray(['80', '81', '82', '83', '84', '85'])}.0.${generateVersionNumber(4)}.${generateVersionNumber(3)}`],
            SAFARI_VERSION: [`60${chooseItemFromArray(['4', '5'])}.1`, `537.36`],
            WINDOWS_VERSION: ['10.0', '6.1', '6.2', '6.3'],
            MAC_OSX_VERSION: [`${chooseItemFromArray(['8', '9', '10'])}_${generateNumberBetweenTwoNumbers(6, 13)}_${generateVersionNumber(1)}`]

        }

        let templates = {
            desktop: {
                windowsChrome: `Mozilla/5.0 (Windows NT ${chooseItemFromArray(generatedBrowserData.WINDOWS_VERSION)}; Win64; x64)` +
                    ` AppleWebKit/${chooseItemFromArray(generatedBrowserData.WEBKIT_VERSION)}` +
                    ` Chrome/${chooseItemFromArray(generatedBrowserData.CHROME_VERSION)}` +
                    ` Safari/${chooseItemFromArray(generatedBrowserData.SAFARI_VERSION)}`
                ,

                macOSXChrome: `Mozilla/5.0 (Macintosh; Intel Mac OS X ${chooseItemFromArray(generatedBrowserData.MAC_OSX_VERSION)})` +
                    ` AppleWebKit/${chooseItemFromArray(generatedBrowserData.WEBKIT_VERSION)}` +
                    ` (KHTML, like Gecko) Chrome/${chooseItemFromArray(generatedBrowserData.CHROME_VERSION)}` +
                    ` Safari/${chooseItemFromArray(generatedBrowserData.SAFARI_VERSION)}`
            },
            mobile: {
                iOSSafari: `Mozilla/5.0 (iPhone; CPU iPhone OS ${chooseItemFromArray(generatedBrowserData.IOS_VERSION)} like Mac OS X)` +
                    ` AppleWebKit/${chooseItemFromArray(generatedBrowserData.WEBKIT_VERSION)} (KHTML, like Gecko)` +
                    ` Version/${chooseItemFromArray(generatedBrowserData.SAFARI_IOS_VERSIONS)}` +
                    ` Mobile/${chooseItemFromArray(generatedBrowserData.SAFARI_BUILD_IDS)}` +
                    ` Safari/${chooseItemFromArray(generatedBrowserData.SAFARI_VERSION)}`
            }
        };

        // Randomly select the platform
        let chosenPlatform = templates[Object.keys(templates)[Math.floor(Math.random() * Object.keys(templates).length)]];

        // Select a random UA from the list of available
        return chosenPlatform[Object.keys(chosenPlatform)[Math.floor(Math.random() * Object.keys(chosenPlatform).length)]];
    }

    getPreviousRequestOptions() {
        return this.options;
    }

    addOrModifyHTTPHeader(headerName, value) {
        if (this.options !== undefined && this.options.headers !== undefined) {
            this.debugStatement('addOrModifyHTTPHeader', 'Adding custom header ' + headerName + ' to the HTTP headers');
            this.options.headers[headerName] = value;
        } else {
            throw new Error("Do not attempt to add custom cookies before the options for a request have been set.");
        }
        return this.options.headers[headerName];
    }

    /**
     * @param cookieString String - the cookies in string format to append. E.g. "sessionID=abc-123;userID=def-456"
     *
     * @returns the full cookie string for the next HTTP request
     */
    addCustomHTTPCookies(cookieString) {
        if (this.options !== undefined && this.options.headers !== undefined) {
            this.debugStatement('addCustomHTTPCookies', 'Adding ' + cookieString + ' to the HTTP Cookies');
            this.options.headers['Cookie'] += cookieString;
        } else {
            throw new Error("Do not attempt to add custom cookies before the options for a request have been set.");
        }
        return this.options.headers['Cookie'];
    }


    sendHTTPRequest(callback) {
        this.callback = callback !== undefined ? callback : undefined;
        this.debugStatement('sendHTTPRequest', 'Sending HTTP Request');

        return request(this.options, (err, resp, body) => {
            this.HTTPResponseHandler(err, resp, body)
        });
    }

    HTTPResponseHandler(error, response, body) {
        this.debugStatement('HTTPResponseHandler', 'HTTP Response received.');
        this.httpResponse = {
            response: response,
            body: body
        };

        if (!error) {
            if (this.stickySessions) {
                this.debugStatement('HTTPResponseHandler', 'stickySessions enabled. Stepping through Cookie functions.');

                this.setCookiesFromHTTPRequestForSubsequentRequests(response.headers);
            }
        }

        if (this.callback !== undefined) {
            this.callback(error, response, body, this);
        }

    }

    setCookiesFromHTTPRequestForSubsequentRequests(headers) {
        if (headers['set-cookie'] !== undefined) {
            let cookiesToSet = headers['set-cookie'];

            this.debugStatement('setCookiesFromHTTPRequestForSubsequentRequests', 'Cookies received from server.');

            for (let cookie in cookiesToSet) {
                let cookieToAppend = this.splitCookieIntoNameAndValue(cookiesToSet[cookie]);
                this.options.headers['Cookie'] += cookieToAppend;
                this.debugStatement('setCookiesFromHTTPRequestForSubsequentRequests', 'Added new cookie : '
                    + cookieToAppend + ' to session cookies.')
            }
        }
    }

    splitCookieIntoNameAndValue(setCookieValue) {
        return setCookieValue.split(' ')[0];
    }

    internalDataStoreHandler() {
        let store = {};

        return {
            set: function (key, value) {
                store[key] = value;
                return value;
            },

            get: function (key) {
                return store[key];
            },

            delete: function (key) {
                delete store[key];
                return true;
            }
        }
    }

    debugStatement(fn, message) {
        if (this.debug === true) {
            console.log('[ httpService.' + fn + ' ] : ' + message);
        }

        return null;
    }

}

module.exports = httpService;