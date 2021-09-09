/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will add a custom cookie to a simple GET request.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"country": "CA"},
    debug: true
});


let cookiesAsString = "sessionID=abc-123-456-def;userToken=fed-654-321-cba;";


let httpClient = creton.createNewHTTPClient();

httpClient.setOptionsForFirstRequest("http://www.example.com/", "GET");

// Add the custom cookie
httpClient.addCustomHTTPCookies(cookiesAsString);

httpClient.sendHTTPRequest((err, resp, body) => {
    if (err) {
        console.log(err);
        return;
    }
    if (resp.statusCode !== 200) {
        console.log('\nHmm Looks like something went wrong... This proxy needs to be discarded.');
    } else {
        console.log('\nWe loaded the resource! This proxy works!');
    }
});
