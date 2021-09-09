/**
 * This is an example bot written with the CretonJS framework.
 *
 * This is an example of updating the current proxy list with new proxies from the default sources.
 */

const Creton = require('../index');

let creton = new Creton({
    debug: true
});

creton.proxy.getLatestProxyLists();