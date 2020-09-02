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

httpClient.setOptionsForFirstRequest("https://api.my-ip.io/ip.json", "GET");

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