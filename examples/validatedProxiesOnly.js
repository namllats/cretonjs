/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this examples, we will be attempting to send 100 GET requests and half second intervals.
 *
 * We want the highest success rate of proxies, so we will set the flag validateProxies:true when instantiating the CretonJS instance.
 *
 * We will also randomly select proxies that have been validated, as opposed to running through linearly.
 *
 * We will then set the requests to be made every 500 milliseconds using the setInterval function.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"country": "US"},
    // validateProxies:true flag will trigger this Creton instance to test each proxy individually.
    // It will then create a new, "fresh" pool of validated proxies.
    validateProxies: true,
    randomProxySelection: true,
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

setInterval(createNewClientAndSendRequest, 500);
