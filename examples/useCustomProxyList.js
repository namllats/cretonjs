/**
 * This is an example use of the CretonJS framework.
 *
 * In this example, we will be reading in a custom proxy list from disk for the source of our HTTP Requests.
 */

const Creton = require('../index');

let proxyListPath = __dirname + '/src/proxies.txt';

let creton = new Creton({
    proxyListPath: proxyListPath,
    proxyFilters: {"country": "US"}, // Select all proxies from this list that are located within the US.
    debug: true
});