const httpService = require('./src/http/httpService');
const proxyService = require('./src/proxy/proxyService');


class creton {
    constructor(config, debug) {
        // Init proxy service
        this.proxy = new proxyService(config.proxyFilters, debug);
        this.proxy.loadProxyList(config.proxyListPath);

        // Init http service as client
        this.httpClient = httpService;
    }
}

module.exports = creton;