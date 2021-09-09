/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, all we are going to do is read out all of the proxies that will be available to us after intialisation.
 * This can be useful to track how many active proxies you're using, how many requests have gone through each one and any other stats
 * that are attached to each proxy.
 */

const Creton = require('../index');

let creton = new Creton({
    proxyFilters: {"country": "CA"},
    validateProxies: true,
    debug: true
});

let availableProxiesAtInitialisation = creton.getCurrentProxyList();

// first log out all of the proxies that are available the moment after we initalise, within the region CA
console.log(availableProxiesAtInitialisation);


// Secondly lets log out the verified proxy states after three seconds of "verification" has completed.
setTimeout(() => {
    let proxiesAvailableAfterTwoSeconds = creton.getCurrentProxyList();

    console.log(proxiesAvailableAfterTwoSeconds.verified);

}, 3000);