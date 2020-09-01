# CretonJS
### Overview
CretonJS is a HTTP abstraction layer for creating a sophisticated non browser based HTTP client.
This framework will enable you to create a location aware HTTP client that has the ability to mimic legitimate human behaviour / traffic.

Currently, the framework supports:

- Location filtering on proxy nodes e.g. Region -> Country -> City
- HTTP Header randomization e.g. random ordering of all headers, random content of User-Agent and Accept-Language

In the future this framework will support:

- Automatic proxy network updating, using public sources.
- Automatic validation that the proxies do in fact work (Currently they must be pre vetted)
- "Smokescreen" functionality to create erroneous SOC alerts. e.g. Large volumes of requests from IPs outside of the target GEO, using static UA's and headers.

## Usage
### Installation
TODO: CREATE NPM MODULE

### Getting Started
To Initialize Creton, you'll need to include the module in a file, and create a new instance of the Creton class.
```js
const Creton = require('cretonjs');

let creton = new Creton();

let HTTPService = new creton.httpService(creton.proxy.fetchNextProxy().address);
```