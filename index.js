const httpService = require('./src/http/httpService');
const proxyService = require('./src/proxy/proxyService');


class Creton {
    constructor(config) {
        // Init config
        this.config = config;
        // Init proxy service
        this.proxy = new proxyService(this.config.proxyFilters, this.config.validateProxies,
            this.config.randomProxySelection, this.config.debug);

        // Do not perform this if flag is false. This occurs on init run to collect local proxies
        this.proxy.loadProxyList(this.config.proxyListPath);

        if (config.validateProxies === true) {
            this.proxy.testLoadedProxyList(this.config.proxyValidationConfiguration);
        }

        // Init http service as client
        this.httpClient = httpService;
    }

    createNewHTTPClient(customProxyAddress) {
        let nextProxyAddress = customProxyAddress === undefined ? this.proxy.fetchNextProxy().address : customProxyAddress;

        return new this.httpClient(nextProxyAddress, this.config.stickySessions, this.config.debug);
    }

    getCurrentProxyList() {
        return this.proxy.getListOfProxies();
    }

}

module.exports = Creton;