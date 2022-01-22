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
            callbackFunction: null
        };

        if (parameters.length == 4) {                    // url, getData, postData, callbackFunction
            postParameters.getData = parameters[1];
            postParameters.postData = parameters[2];
            postParameters.callbackFunction = parameters[3];
        }
        else if (parameters.length == 2) {               // url, postData
            postParameters.postData = parameters[1];
        }
        else {
            if (typeof parameters[2] == "function") {    // url, postData, callbackFunction
                postParameters.postData = parameters[1];
                postParameters.callbackFunction = parameters[2];
            }
            else {                                      // url, getData, postData
                postParameters.getData = parameters[1];
                postParameters.postData = parameters[2];
            }
        }

        return postParameters;
    }

    static _send(method, url, getQueryString, rawPostData, callbackFunction) {
        const request = new Request(
            url + (getQueryString? ("?" + getQueryString) : ""),
            {
                method:         method,
                credentials:    "include",
                body:           (rawPostData ? rawPostData : null)
            }
        );

        window.fetch(request, { credentials: "same-origin" })
            .then(function(response) {
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
                if (typeof callbackFunction == "function") {
                    const json = { wasSuccess: false, errorMessage: "No response." };
                    callbackFunction(json);
                }
            });
    }

    static get(url, getData, callbackFunction) {
        Http._send("GET", url, Http._jsonToQueryString(getData), null, callbackFunction);
    }

    static post() { // Params: url, getData, postData, callbackFunction
        const postParameters = Http._getPostParameters(arguments);
        Http._send("POST", postParameters.url, Http._jsonToQueryString(postParameters.getData), Http._jsonToQueryString(postParameters.postData), postParameters.callbackFunction);
    }

    static postJson() { // Params: url, getData, postData, callbackFunction
        const postParameters = Http._getPostParameters(arguments);
        Http._send("POST", postParameters.url, Http._jsonToQueryString(postParameters.getData), postParameters.postData, postParameters.callbackFunction);
    }
}
