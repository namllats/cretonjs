# CretonJS
### Overview
CretonJS is an HTTP abstraction layer / wrapper around the [Request](https://github.com/request/request) library for creating a sophisticated, non browser based HTTP client.
This framework will enable you to leverage free (and paid) proxy networks to create scripts that are able to accurately simulate real world attacks on web applications.

This framework is to be used by penetration testers or developers who wish to test the security of their applications.    

Currently, the framework supports:

- Location filtering on proxy nodes e.g. `Region -> Country -> City`
- Automatic proxy rotation
- HTTP Header randomization e.g. random ordering of all headers, random content of User-Agent and Accept-Language
- "Sticky" HTTP Sessions to ensure continuity of Cookies, IPs, User Agents etc.

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

### Setting the HTTP Request options

There are two mechanisms to set / update the HTTP headers that will be used by the current HTTPClient instance.
Firstly, you can use the `setOptionsForFirstRequest` function, or the `updateRequestOptionsForNextRequest`. These are typically chained when sending multiple requests per HTTPClient.

They both take three arguments: `<uri>, <HTTPMethod>, <HTTPBody>` and are used as follows:

```js
HTTPService.setOptionsForFirstRequest('http://example.com', 'GET');
// Send request.....

// When its time for the next request
HTTPService.updateRequestOptionsForNextRequest('http://example.com/login','POST',{username:"test", password:"test"});
```
See `/examples/chainingHTTPGetRequestsFromASingleIP.js` for a practical example of how to use this functionality.
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
`body => the Body of the HTTP response`

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

### Accessing HTTP request options from the previous request
If you need to access any information from the request that was just sent, that called the current callback function, you can access this directly from the HTTPClient.
Call the `getPreviousRequestOptions()` function to have the request options that were passed through to the underlying Request library.

```js
httpClient.sendHTTPRequest((err, resp, body) => {
    if (err) {
        console.log(err);
        return;
    }
    // If the previous request was a POST, you can access the body that was sent to the server.
    console.log(this.getPreviousRequestOptions().body);
    
    // Access the full HTTP Header object from the previous request
    console.log(this.getPreviousRequestOptions().headers);

});
```

### Continuity of sessions
To make traffic less suspicious, it can be important to have continuity within each individual session.
This involves setting HTTP Cookies for subsequent HTTP requests and ensuring that the HTTP Headers remain the same on a "Per IP" basis.

To use this functionality within Creton, simply add the `stickySessions:true` flag when instantiating an instance of Creton.

```js
let creton = new Creton({
    stickySessions: true
});
```
Note: See `./examples/simpleBruteForce.js` for a practical example / use case for sticky sessions.

The other way to access the HTTP response is via the HTTP Client `httpResponse` object. This will be filled on the HTTP request has been executed and will contain the `<response>` and `<body>`.

```js
 // After the HTTP request has been sent and response received
 // you can access the following attributes

let HTTPStatusCode = httpClient.httpResponse.statusCode;

let HTTPResponseHeaders = httpClient.httpResponse.headers;

let HTTPResponseBody = httpClient.httpResponse.body;
```

### Examples
See `/examples` for example code. This will be added to in order to be more comprehensive.