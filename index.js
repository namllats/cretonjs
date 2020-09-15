const httpService = require('./src/http/httpService');
const proxyService = require('./src/proxy/proxyService');


class Creton {
    constructor(config) {
        // Init config
        this.config = config;
        // Init proxy service
        this.proxy = new proxyService(this.config.proxyFilters, this.config.validateProxies, this.config.debug);

        // Do not perform this if flag is false. This occurs on init run to collect local proxies
        if (config.readProxyListFromDisk !== false) {
            this.proxy.loadProxyList(this.config.proxyListPath);

            if (config.validateProxies === true) {
                this.proxy.testLoadedProxyList();
            }
        }

        // Init http service as client
        this.httpClient = httpService;
    }

    createNewHTTPClient(customProxyAddress) {
        let nextProxyAddress = customProxyAddress === undefined ? this.proxy.fetchNextProxy().address : customProxyAddress;

        return new this.httpClient(nextProxyAddress, this.config.stickySessions, this.config.debug);
    }

}

module.exports = Creton;