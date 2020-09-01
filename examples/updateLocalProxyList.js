/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will target a website with GET requests from Canada based IPs to confirm that they do in fact work.
 */

const Creton = require('../index');

let creton = new Creton({loadProxies: false}, true);

creton.proxy.getLatestProxyLists();