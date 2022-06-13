"use strict";
class Http {
    static _jsonToQueryString(jsonData) {
        return Object.keys((jsonData ? jsonData : { })).map(key => window.encodeURIComponent(key) + "=" + window.encodeURIComponent(jsonData[key])).join("&");
    }

    static _getPostParameters(parameters) {
        const postParameters = {
            url: parameters[0],
            getData: null,
            postData: null,
            callbackFunction: null,
            timeoutMs: null
        };

        if (parameters.length == 5) {                    // url, getData, postData, callbackFunction, timeoutMs
            postParameters.getData = parameters[1];
            postParameters.postData = parameters[2];
            postParameters.callbackFunction = parameters[3];
            postParameters.timeoutMs = parameters[4];
        }
        else if (parameters.length == 2) {               // url, postData
            postParameters.postData = parameters[1];
        }
        else {
            if (typeof parameters[2] == "function") {    // url, postData, callbackFunction, timeoutMs
                postParameters.postData = parameters[1];
                postParameters.callbackFunction = parameters[2];
                postParameters.timeoutMs = parameters[3];
            }
            else {                                      // url, getData, postData
                postParameters.getData = parameters[1];
                postParameters.postData = parameters[2];
            }
        }

        return postParameters;
    }

    static _send(method, url, getQueryString, rawPostData, callbackFunction, timeoutMs) {
        const request = new Request(
            url + (getQueryString? ("?" + getQueryString) : ""),
            {
                method:         method,
                credentials:    "include",
                body:           (rawPostData ? rawPostData : null)
            }
        );

        const requestOptions = { credentials: "same-origin" };

        let abortTimeout = 0;
        if (timeoutMs > 0) {
            const abortController = new AbortController();
            requestOptions.signal = abortController.signal;

            abortTimeout = window.setTimeout(function() {
                abortController.abort();
            }, timeoutMs);
        }

        window.fetch(request, requestOptions)
            .then(function(response) {
                window.clearTimeout(abortTimeout);

                const contentType = (response.headers.get("content-type") || "");
                if (contentType.includes("application/json")) {
                    return response.json();
                }
                return { wasSuccess: false, errorMessage: "Invalid response." };
            })
            .then(function(json) {
                if (typeof callbackFunction == "function") {
                    callbackFunction(json);
                }
            })
            .catch(function(error) {
                window.clearTimeout(abortTimeout);

                if (typeof callbackFunction == "function") {
                    const json = { wasSuccess: false, errorMessage: "No response." };
                    callbackFunction(json);
                }
            });
    }

    static get(url, getData, callbackFunction, timeoutMs) {
        Http._send("GET", url, Http._jsonToQueryString(getData), null, callbackFunction, timeoutMs);
    }

    static post() { // Params: url, getData, postData, callbackFunction, timeoutMs
        const postParameters = Http._getPostParameters(arguments);
        Http._send("POST", postParameters.url, Http._jsonToQueryString(postParameters.getData), Http._jsonToQueryString(postParameters.postData), postParameters.callbackFunction, postParameters.timeoutMs);
    }

    static postJson() { // Params: url, getData, postData, callbackFunction, timeoutMs
        const postParameters = Http._getPostParameters(arguments);
        Http._send("POST", postParameters.url, Http._jsonToQueryString(postParameters.getData), postParameters.postData, postParameters.callbackFunction, postParameters.timeoutMs);
    }
}
