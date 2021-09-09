/**
 * DO NOT MODIFY
 *
 * Post Install script designed to pull latest proxy list automatically.
 */

console.log('Running CretonJS PostInstall script. Located @ src/helpers/postinstall.js');


const ProxyService = require('../proxy/proxyService');


// Create empty proxy class
this.proxy = new ProxyService({}, false, false, true);
// Load latest proxy list
this.proxy.getLatestProxyLists();