const httpService = require('./src/http/httpService');
const proxyService = require('./src/proxy/proxyService');


class creton {
    constructor(config) {
        // Init proxy service
        this.proxy = new proxyService(config.proxyFilters, config.debug);

        // Do not perform this if flag is false. This occurs on init run to collect local proxies
        if (config.loadProxies !== false) {
            this.proxy.loadProxyList(config.proxyListPath);
        }

        // Init http service as client
        this.httpClient = httpService;
    }
}

module.exports = creton;