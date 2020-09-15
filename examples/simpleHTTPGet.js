/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will target a website with GET requests from Canada based IPs to confirm that they do in fact work.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"country": "CA"},
    debug: true
});

let httpClient = creton.createNewHTTPClient();

httpClient.setOptionsForFirstRequest("http://www.example.com/", "GET");

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
