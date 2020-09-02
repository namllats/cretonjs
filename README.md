# CretonJS
### Overview
CretonJS is an HTTP abstraction layer for creating a sophisticated non browser based HTTP client.
This framework will enable you to create a location aware HTTP client that has the ability to mimic legitimate human behaviour / traffic.

Currently, the framework supports:

- Location filtering on proxy nodes e.g. `Region -> Country -> City`
- Automatic proxy rotation
- HTTP Header randomization e.g. random ordering of all headers, random content of User-Agent and Accept-Language

In the future this framework will support:

- Automatic validation that the proxies do in fact work (Currently they are assumed to be working)
- "Smokescreen" functionality to create erroneous SOC alerts. e.g. Large volumes of requests from IPs outside of the target GEO, using static UA's and headers.
- Support for Luminati and other paid proxy services

## Usage
### Installation
`npm install cretonjs --save`

### Loading the proxy lists
To Initialize Creton, you'll need to include the module in a file, and create a new instance of the Creton class to pull down the latest proxy lists.
This process *must* be performed before the framework can be used.
```js
const Creton = require('cretonjs');

let creton = new Creton({readProxyListFromDisk: false});

creton.proxy.getLatestProxyLists();
```

### Getting started

To create an instance of Creton to use for your HTTP Client, instantiate the class.
```js
const Creton = require('cretonjs');

let creton = new Creton();
```

To create a new HTTP client using the proxy and HTTP library provided by Creton, you'll need to create a new instance of the Creton HTTPService class.

By default, your Creton instance will select the next proxy in the chain to use for the new HTTP client.
If you wish to use your own proxy, you can provide the IP and port as a string when calling the `createNewHTTPClient` function.
```js
let HTTPService = creton.createNewHTTPClient(); // Will load the next proxy in the chain
let HTTPService = creton.createNewHTTPClient('127.0.0.1:8080'); // Will use the provided proxy
```

### Filtering proxies
When it comes to filtering proxies, you have three levels of control: Region, Country, City.

The filtering is done via passing a simple config JSON object into the `Creton` class upon instantiation.

Note: Country and Region codes follow [ISO 3166](https://www.iso.org/iso-3166-country-codes.html) , you can search through the codes [here](https://www.iso.org/obp/ui/#search)
```js
let proxyFilter = {"country": "FR"}

let creton = new Creton({
    proxyFilter: proxyFilter
});
```

### Custom proxy list
If you wish to load your own proxy list, it must adhere to the following pattern. `IP:PORT\n`.

Example:
```
127.0.0.1:8080
10.0.0.1:1337
```
To load this into your Creton instance, add a config flag for `proxyListPath` like such:

```js
let proxyListPath = '~/proxies.txt';

let creton = new Creton({
    proxyListPath: proxyListPath
});

```
Note: You can still perform geographic filtering on a custom proxy list using the regular `proxyFilter` config object.

### Header randomization
Currently, Creton will handle the generation of `random` HTTP headers. This includes:
- Randomization of the `user-agent` header with strings from mobile devices and desktops
- Randomization of the `accept-language` header with the top 10 common variants
- Randomization of the HTTP Header ordering, to avoid HTTP based fingerprinting.

This is all handled behind the scenes, however you can see the output of this by enabling the `debug` flags on your Creton instance.

### Debug logging
To gain extra visbility into what is occuring within Creton, you can simply add a `debug:true` flag whenever you are instantiating a new class.

```js
const Creton = require('cretonjs');

let creton = new Creton({
    proxyFilter: proxyFilter,
    debug: true // Debug:true flag
}); 

let HTTPService = creton.createNewHTTPClient();
```

### Accessing the HTTP response
You have the ability to access the HTTP response to a Creton request in two ways. Firstly, a custom `callback` that takes in the following arguments:
`err => any errors encountered during the HTTP request;`
`response => the raw HTTP response, including headers;`
`body => the Body of the http response`

An example callback would be:
```js
httpClient.sendHTTPRequest((err, resp, body) => {
    if (err) {
        console.log(err);
        return;
    }
    if (resp.statusCode !== 200) {
        console.log('Hmm Looks like something went wrong... This proxy needs to be discarded.');
    } else {
        console.log('We loaded the resource! This proxy works!');
        console.log(body);
    }
});
```

The other way to access the HTTP response is via the HTTP Client `httpResponse` object. This will be filled on the HTTP request has been executed and will contain the `<response>` and `<body>`.

### Examples
See `/examples` for example code. This will be added to in order to be more comprehensive.