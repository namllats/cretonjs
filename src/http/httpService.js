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

    getRandomUserAgent() {
        const UAs = [
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/69.0.3497.105 Mobile/15E148 Safari/605.1",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/13.2b11866 Mobile/16A366 Safari/605.1.15",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a Safari/604.1",
            "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; RM-1127_16056) AppleWebKit/537.36(KHTML, like Gecko) Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10536",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.50",
            "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.48",
            "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16294",
            "Mozilla/5.0 (Linux; Android 10; SM-A205G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.111 Mobile Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.26 Safari/537.36",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/49.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.3497.100 Safari/537.36"
        ];

        return UAs[Math.floor(Math.random() * UAs.length)];
    }

    getPreviousRequestOptions() {
        return this.options;
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