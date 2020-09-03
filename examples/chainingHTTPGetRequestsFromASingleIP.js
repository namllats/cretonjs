/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will chain a number of HTTP GET requests together from a single proxy IP, out of the EU.
 *
 * The goal of chaining is to more accurately mimic human behavior. So we will first load the root page, then the subsequent resource.
 *
 * When chaining, the user agent and other headers will remain the same from request to request. This avoids a single IP having multiple HTTP fingerprints.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"region": "EU"},
    debug: true
});


let httpClient = creton.createNewHTTPClient();

// HTTP Response Handlers
// First HTTP Response handler has the httpClient passed to it, so that it can be re used when chaining subsequent requests
let firstHTTPRequestResponseHandler = function (err, resp, body, httpClient) {
    if (err) {
        console.log(err);
        return;
    }
    if (resp.statusCode !== 200) {
        console.log('Hmm Looks like something went wrong... This proxy needs to be discarded.');
    } else {
        console.log('Alright! We performed the first request! Nothing suspicious here...');

        httpClient.updateRequestOptionsForNextRequest("https://api.my-ip.io/ip.json", "GET");

        httpClient.sendHTTPRequest(secondHTTPRequestResponseHandler);

    }
};

let secondHTTPRequestResponseHandler = function (err, resp, body, httpClient) {
    if (err) {
        console.log(err);
        return;
    }
    if (resp.statusCode !== 200) {
        console.log('Hmm Looks like something went wrong... This proxy needs to be discarded.');
    } else {
        console.log('Victory! We have now loaded the resource we wanted. All whilst presenting a legitimate browsing pattern.');
    }
};

// Setup of first request
httpClient.setOptionsForFirstRequest("https://api.my-ip.io/", "GET");

// Trigger first request
httpClient.sendHTTPRequest(firstHTTPRequestResponseHandler);