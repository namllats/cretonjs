/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will target a website with GET requests from Canada based IPs to confirm that they do in fact work.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"country": "CA"},
    validateProxies: true,
    proxyValidationConfiguration: {
        // whether or not we use https
        secure: false,
        // domain and path to send the health check request to
        endpoint: 'www.example.com/favicon.ico',
        // HTTP method
        method: 'GET',
        // HTTP Response code from target that indicates "success"
        expectedStatusCode: 200,
        // The maximum acceptable latency from the proxies
        maxLatency: 2500
    },
    debug: true
});

let totalRequestCount = 0;


let createNewClientAndSendRequest = function () {
    if (totalRequestCount > 100) {
        console.log('The requests have been completed.');
        return;
    }

    let httpClient = creton.createNewHTTPClient();

    httpClient.setOptionsForFirstRequest("http://www.example.com/", "GET");

    // Increment the request counter
    totalRequestCount++;

    httpClient.sendHTTPRequest((err, resp, body) => {
        if (err) {
            console.log(err);
            return;
        }
        if (resp.statusCode !== 200) {
            console.log('Hmm Looks like something went wrong... This proxy needs to be discarded.');
        } else {
            console.log('We loaded the resource! This proxy works!');
        }
    });
}

setInterval(createNewClientAndSendRequest, 1000);