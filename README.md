# CretonJS
### Overview
CretonJS is an HTTP abstraction layer for creating a sophisticated non browser based HTTP client.
This framework will enable you to create a location aware HTTP client that has the ability to mimic legitimate human behaviour / traffic.

Currently, the framework supports:

- Location filtering on proxy nodes e.g. `Region -> Country -> City`
- HTTP Header randomization e.g. random ordering of all headers, random content of User-Agent and Accept-Language

In the future this framework will support:

- Automatic switching to next proxy in chain
- Automatic validation that the proxies do in fact work (Currently they are assumed to be working)
- "Smokescreen" functionality to create erroneous SOC alerts. e.g. Large volumes of requests from IPs outside of the target GEO, using static UA's and headers.

## Usage
### Installation
TODO: CREATE NPM MODULE

### Loading the proxy lists
To Initialize Creton, you'll need to include the module in a file, and create a new instance of the Creton class to pull down the latest proxy lists.
This process *must* be performed before the framework can be used.
```js
const Creton = require('cretonjs');

let creton = new Creton({loadProxies: false});

creton.proxy.getLatestProxyLists();
```

### Getting started

To create an instance of Creton to use for your HTTP Client, instantiate the class.
```js
const Creton = require('cretonjs');

let creton = new Creton();
```

To create a new HTTP client using the proxy and HTTP library provided by Creton, you'll need to create a new instance of the Creton HTTPService class.

The next HTTP Proxy address will then need to be pass as a parameter through to the `constructor()`. This gives you the ability to pass your own HTTP proxies in as well as using
the in built proxying mechanisms that Creton provides. 
```js
let HTTPProxyAddressToUse = creton.proxy.fetchNextProxy().address;

let HTTPService = new creton.httpService(HTTPProxyAddressToUse);
```

### Filtering Proxies
When it comes to filtering proxies, you have three levels of control: Region, Country, City.

The filtering is done via passing a simple config JSON object into the `Creton` class upon instantiation.

Note: Country and Region codes follow [ISO 3166](https://www.iso.org/iso-3166-country-codes.html) , you can search through the codes [here](https://www.iso.org/obp/ui/#search)
```js
let proxyFilter = {"country": "FR"}

let creton = new Creton({
    proxyFilter: proxyFilter
});
```

### Header randomization
Currently, Creton will handle the generation of `random` HTTP headers. This includes:
- Randomization of the `user-agent` header with strings from mobile devices and desktops
- Randomization of the `accept-language` header with the top 10 common variants
- Randomization of the HTTP Header ordering, to avoid HTTP based fingerprinting.

This is all handled behind the scenes, however you can see the output of this by enabling the `debug` flags on the HTTPService

### Debug logging
To gain extra visbility into what is occuring within Creton, you can simply add a `debug:true` flag whenever you are instantiating a new class.

```js
const Creton = require('cretonjs');

let creton = new Creton({
    proxyFilter: proxyFilter,
    debug: true // Debug:true flag
}); 

let HTTPProxyAddressToUse = creton.proxy.fetchNextProxy().address;

let HTTPService = new creton.httpService(HTTPProxyAddressToUse, true); // Debug:true flag
```

### Examples
See `/examples` for example code. This will be added to in order to be more comprehensive.