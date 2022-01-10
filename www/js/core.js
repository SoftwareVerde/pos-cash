window.MAX_SAFE_INTEGER = window.Number.MAX_SAFE_INTEGER || 9007199254740991;

class Util {
    static KeyCodes = {
        escape: 27,
        delete: 8,
        tab:    9,
        enter:  13,
        shift:  16
    };

    static cancelEvent(event) {
        if (! event.preventDefault) {
            event.returnValue = false;
            return;
        }
        event.preventDefault();
    }

    static getDecimalSeparator() {
        const formatOptions = { maximumFractionDigits: 2, minimumFractionDigits: 2 };
        const number = 0.12;
        const floatString = number.toLocaleString(undefined, formatOptions);
        return floatString.charAt(1);
    }

    static getThousandsSeparator() {
        const decimalSeparator = Util.getDecimalSeparator();
        return (decimalSeparator == "." ? "," : ".");
    }

    static getDecimalCount(amount) {
        const decimalSeparator = Util.getDecimalSeparator();
        const amountString = amount;
        const decimalIndex = amountString.indexOf(decimalSeparator);
        if (decimalIndex < 0) { return 0; }

        return (amountString.length - decimalIndex - 1);
    };

    static isMobile() {
        const matchers = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
        return matchers.some(function(item) {
            return navigator.userAgent.match(item);
        });
    }

    static toSatoshis(amount) {
        amount = window.parseFloat(amount);
        return window.Math.round(amount * 100000000); // Round (not floor/ceil) is necessary due to floating point arithmetic.
    }

    static fromSatoshis(amount) {
        amount = window.parseInt(amount);
        return (amount / 100000000);
    }

    static createQrCode(content) {
        return window.bitaddress.qrCode.createCanvas(content, 4);
    }

    static copyToClipboard(text) {
        const clipboard = (window.navigator ? window.navigator.clipboard : null);
        if (clipboard) {
            clipboard.writeText(text);
            return;
        }

        const textArea = document.createElement("textarea");

        textArea.style.position = "absolute";
        textArea.style.bottom = 0;
        textArea.style.right = 0;
        textArea.style.width = "1px";
        textArea.style.height = "1px";
        textArea.style.padding = 0;
        textArea.style.border = "none";
        textArea.style.opacity = 0;

        textArea.value = text;

        const body = document.querySelector("body");
        body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand("copy");
        }
        catch (error) { }

        body.removeChild(textArea);
    }

    static captureQrCodeFromCamera(renderDestination, callback) {
        const templates = document.getElementById("templates");
        const template = templates.querySelector(".qr-code-scanner");
        const widget = template.cloneNode(true);

        const video = widget.querySelector(".video");
        const cancelButton = widget.querySelector(".cancel-button");

        cancelButton.onclick = function() {
            QrCodeScanner.stop();
            widget.remove();

            if (typeof callback == "function") {
                window.setTimeout(function() {
                    callback(null);
                }, 0);
            }
        };

        renderDestination.appendChild(widget);

        QrCodeScanner.start(video, function(qrCode) {
            QrCodeScanner.stop();
            widget.remove();

            if (typeof callback == "function") {
                window.setTimeout(function() {
                    callback(qrCode);
                }, 0);
            }
        });
    }
}

class App {
    static _onLoad = [];
    static _hasLoaded = false;
    static _exchangeRateData = { };
    static _webSockets = [];
    static _pendingPayment = null;
    static _countries = null;
    static _strings = null;
    static _sha256 = null;
    static _toastTimeout = null;

    static _decodeAddress(addressString) {
        const isValidResult = function(result) {
            return (result && typeof result != "string");
        };

        let result = window.libauth.decodeBase58Address(App._sha256, addressString);
        if (isValidResult(result)) { return result; }

        result = window.libauth.decodeCashAddressFormat(addressString);
        if (isValidResult(result)) { return result; }

        result = window.libauth.decodeCashAddressFormat("bitcoincash:" + addressString);
        if (isValidResult(result)) { return result; }

        return null;
    }

    static _isUniquePayment(transactionHash) {
        const completedPayments = App.getCompletedPayments();
        for (let i = 0; i < completedPayments.length; i += 1) {
            const completedPayment = completedPayments[i];
            if (completedPayment.transactions.indexOf(transactionHash) >= 0) {
                return false;
            }
        }
        return true;
    }

    static initialize(callback) {
        Http.get("/api/v1/countries.json", { }, function(data) {
            App._countries = data;

            if (App.isInitialized()) {
                if (typeof callback == "function") {
                    callback();
                }
            }
        });

        Http.get("/api/v1/strings.json", { }, function(data) {
            App._strings = data;

            if (App.isInitialized()) {
                if (typeof callback == "function") {
                    callback();
                }
            }
        });
    }

    static isInitialized() {
        if (App._countries == null) { return false; }
        if (App._strings == null) { return false; }
        return true;
    }

    static addOnLoad(callback) {
        if (App._hasLoaded) {
            window.setTimeout(callback, 0);
            return;
        }

        App._onLoad.push(callback);
    }

    static onLoad() {
        if (App._hasLoaded) { return; }
        App._hasLoaded = true;

        for (let i = 0; i < App._onLoad.length; i += 1) {
            const callback = App._onLoad[i];
            callback();
        }
    }

    static setScreen(screen) {
        const main = document.getElementById("main");
        while (main.firstChild) {
            const widget = main.firstChild;
            if (typeof widget.unload == "function") {
                widget.unload();
            }
            main.removeChild(widget);
        }

        if (screen) {
            main.appendChild(screen);
        }
    }

    static setPin(value) {
        const localStorage = window.localStorage;
        localStorage.setItem("pin", value);
    }

    static getPin() {
        const localStorage = window.localStorage;

        const pin = localStorage.getItem("pin");
        if (pin == null) { return ""; }

        return pin;
    }

    static setMerchantName(value) {
        const localStorage = window.localStorage;
        localStorage.setItem("merchantName", value);
    }

    static getMerchantName() {
        const localStorage = window.localStorage;

        const merchantName = localStorage.getItem("merchantName");
        if (merchantName == null) { return ""; }

        return merchantName;
    }

    static setDestinationAddress(value) {
        const localStorage = window.localStorage;
        localStorage.setItem("destinationAddress", value);
    }

    static getDestinationAddress() {
        const localStorage = window.localStorage;
        return localStorage.getItem("destinationAddress");
    }

    static setCountry(value) {
        const localStorage = window.localStorage;
        return localStorage.setItem("country", value);
    }

    static getCountry() {
        const localStorage = window.localStorage;
        return localStorage.getItem("country") || "US";
    }

    static setLanguage(value) {
        const localStorage = window.localStorage;
        return localStorage.setItem("language", value);
    }

    static getLanguage() {
        const localStorage = window.localStorage;
        return localStorage.getItem("language") || "english";
    }

    static getCountries() {
        return App._countries;
    }

    static getCountryData(countryIso) {
        for (let i = 0; i < App._countries.length; i += 1) {
            const country = App._countries[i];
            if (country.iso == countryIso) {
                return country;
            }
        }
        return null;
    }

    static isMultiTerminalEnabled() {
        const localStorage = window.localStorage;
        const isEnabled = localStorage.getItem("multiTerminalIsEnabled");

        if (isEnabled == null) { return false; }
        return (isEnabled ? true : false);
    }

    static setMultiTerminalIsEnabled(isEnabled) {
        const localStorage = window.localStorage;
        return localStorage.setItem("multiTerminalIsEnabled", (isEnabled ? true : false));
    }

    static isAddressValid(addressString) {
        const address = App._decodeAddress(addressString);
        return (address != null);
    }

    static convertToBase58Address(addressString) {
        const address = App._decodeAddress(addressString);
        if (address == null) { return null; }

        const addressBytes = (address.payload || address.hash);
        return window.libauth.encodeBase58Address(App._sha256, address.version, addressBytes);
    }

    static convertToCashAddress(addressString) {
        const address = App._decodeAddress(addressString);
        if (address == null) { return null; }

        const addressBytes = (address.payload || address.hash);
        return window.libauth.encodeCashAddress("bitcoincash", address.version, addressBytes);
    }

    static hash(value) {
        const sha256 = App._sha256;
        const encoder = new window.TextEncoder();
        const data = encoder.encode("" + value);
        const hash = sha256.hash(data);
        return window.libauth.binToBase58(hash);
    }

    static updateExchangeRate() {
        Http.get("https://markets.api.bitcoin.com/rates", {"c": "BCH"}, function(data) {
            if ( (! data) || (data.length == 0) ) { return; }

            const rates = {};
            for (let i = 0; i < data.length; i += 1) {
                const exchangeData = data[i];
                rates[exchangeData.code] = exchangeData.rate;
            }

            rates.timestamp = Math.floor(Date.now() / 1000);
            App._exchangeRateData["bitcoin.com"] = rates;
        });

        Http.get("https://api.coinbase.com/v2/exchange-rates", {"currency": "BCH"}, function(result) {
            if ( (! result) || (! result.data) ) { return; }

            const rates = result.data.rates;
            rates.timestamp = Math.floor(Date.now() / 1000);
            App._exchangeRateData["coinbase.com"] = rates;
        });
        
    }

    static getExchangeRate() {
        if (! App._exchangeRateData) { return null; }

        const countryIso = App.getCountry();
        const country = App.getCountryData(countryIso);
        const currency = country.currency;

        let chosenKey = null;
        let timestamp = 0;
        let rate = null;

        for (let key in App._exchangeRateData) {
            const data = App._exchangeRateData[key];
            if (data.timestamp >= timestamp) {
                if (data[currency]) {
                    rate = data[currency];
                    timestamp = data.timestamp;
                    chosenKey = key;
                }
            }
        }

        return rate;
    }

    static getExchangeRateAge() {
        return App.exchangeRateAge;
    }

    static listenForTransactions() {
        App.stopListeningForTransactions();

        let webSocket = null;

        webSocket = App.listenForTransactionsViaBitcoinVerdeDotOrg();
        App._webSockets.push(webSocket);

        webSocket = App.listenForTransactionsViaBitcoinDotCom();
        App._webSockets.push(webSocket);

        webSocket = App.listenForTransactionsViaBlockchainDotInfo();
        App._webSockets.push(webSocket);
    }

    static listenForTransactionsViaBitcoinVerdeDotOrg() {
        const endpoint = "wss://explorer.bitcoinverde.org/api/v1/announcements";
        const webSocket = new WebSocket(endpoint);
        webSocket._isSubscribed = false;

        const subscribeRequestId = 1;
        webSocket.onopen = function() {
            const message = {
                requestId: subscribeRequestId,
                method: "POST",
                query: "SET_ADDRESSES",
                parameters: []
            };
            const destinationAddress = App.getDestinationAddress();
            message.parameters.push(destinationAddress);

            webSocket.send(JSON.stringify(message));
        };

        webSocket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            const requestId = message.requestId;
            if (requestId == subscribeRequestId) {
                if (message.wasSuccess) {
                    webSocket._isSubscribed = true;
                }
            }

            const objectType = message.objectType;
            if ( (objectType == "TRANSACTION") || (objectType == "TRANSACTION_HASH") ) {
                if (! webSocket._isSubscribed) { return; } // Prevent downloading transactions before the filter is set.

                const transaction = message.object;
                const transactionHash = transaction.hash;

                Http.get("https://explorer.bitcoinverde.org/api/v1/transactions/" + transactionHash, { }, function(data) {
                    if (! data.wasSuccess) { return; }

                    const destinationAddress = App.getDestinationAddress();
                    const address = App.convertToBase58Address(destinationAddress);
                    const transaction = data.transaction;
                    for (let i = 0; i < transaction.outputs.length; i += 1) {
                        const output = transaction.outputs[i];
                        const amount = output.amount;

                        if (output.address == address) {
                            App.onPaymentReceived(transactionHash, amount);
                        }
                    }
                });
            }
        };

        webSocket.onclose = function() {
            console.log("WebSocket closed.");
        };

        return webSocket;
    }

    static listenForTransactionsViaBlockchainDotInfo() {
        const endpoint = "wss://ws.blockchain.info/bch/inv";
        const webSocket = new WebSocket(endpoint);

        webSocket.onopen = function() {
            const message = {
                op: "addr_sub",
                addr: null
            };

            const destinationAddress = App.getDestinationAddress();
            message.addr = destinationAddress;

            webSocket.send(JSON.stringify(message));
        };

        webSocket.onmessage = function(event) {
            const message = JSON.parse(event.data);

            const destinationAddress = App.getDestinationAddress();
            const address = App.convertToCashAddress(destinationAddress);
            const transaction = message.x;
            const transactionHash = transaction.hash.toUpperCase();
            for (let i = 0; i < transaction.out.length; i += 1) {
                const output = transaction.out[i];
                const amount = output.value;

                if (output.addr == address) {
                    App.onPaymentReceived(transactionHash, amount);
                }
            }
        };

        webSocket.onclose = function() {
            console.log("WebSocket closed.");
        };

        return webSocket;
    }

    static listenForTransactionsViaBitcoinDotCom() {
        const endpoint = "wss://bch.api.wallet.bitcoin.com/bws/api/socket/v1/address";
        const webSocket = new WebSocket(endpoint);

        webSocket.onopen = function() {
            const message = {
                op: "addr_sub",
                addr: null
            };

            const destinationAddress = App.getDestinationAddress();
            const address = App.convertToBase58Address(destinationAddress);
            message.addr = address;

            webSocket.send(JSON.stringify(message));
        };

        webSocket.onmessage = function(event) {
            const transaction = JSON.parse(event.data);

            const destinationAddress = App.getDestinationAddress();
            const address = App.convertToBase58Address(destinationAddress);
            const transactionHash = transaction.txid.toUpperCase();
            for (let i = 0; i < transaction.outputs.length; i += 1) {
                const output = transaction.outputs[i];
                const amount = output.value;

                if (output.address == address) {
                    App.onPaymentReceived(transactionHash, amount);
                }
            }
        };

        webSocket.onclose = function() {
            console.log("WebSocket closed.");
        };

        return webSocket;
    }

    static stopListeningForTransactions() {
        const webSockets = App._webSockets;
        for (let i = 0; i < webSockets.length; i += 1) {
            const webSocket = webSockets[i];
            webSocket.close();
        }
        App._webSockets.length = 0;
    }

    static waitForPayment(amount, fiatAmount) {
        amount = (window.parseInt(amount) || null);
        if (! amount) {
            App._pendingPayment = null;
            return;
        }

        const pendingPayment = {
            amount: amount,
            fiatAmount: fiatAmount,

            receivedAmount: 0,
            transactions: [],
            timeCompleted: null
        };
        App._pendingPayment = pendingPayment;
    }

    static getCompletedPayments() {
        const localStorage = window.localStorage;
        return JSON.parse(localStorage.getItem("payments")) || [];
    }

    static addCompletedPayment(completedPayment) {
        const completedPayments = App.getCompletedPayments();
        completedPayments.push(completedPayment);

        const localStorage = window.localStorage;
        localStorage.setItem("payments", JSON.stringify(completedPayments));
    }

    static onPaymentReceived(transactionHash, bchAmount) {
        if (! App._isUniquePayment(transactionHash)) { return; }

        console.log("Payment Received: " + bchAmount);

        const pendingPayment = App._pendingPayment;
        if (pendingPayment == null) { return; }

        bchAmount = (window.parseInt(bchAmount) || 0);
        pendingPayment.receivedAmount += bchAmount;
        pendingPayment.transactions.push(transactionHash);

        if (pendingPayment.receivedAmount >= pendingPayment.amount) {
            console.log("Payment completed.");
            pendingPayment.timeCompleted = window.Math.floor(Date.now() / 1000);

            // Store the completed payment.
            App.addCompletedPayment(pendingPayment);

            // Reset the pending payment information.
            App._pendingPayment = null;

            // Display payment-received screen.
            window.setTimeout(function() {
                const paymentReceivedScreen = PaymentReceivedScreen.create();
                App.setScreen(paymentReceivedScreen);
            }, 0);
        }
    }

    static showAttributions(isEnabled) {
        const attributionDiv = document.getElementById("attribution");
        if (isEnabled) {
            attributionDiv.classList.remove("hidden");
        }
        else {
            attributionDiv.classList.add("hidden");
        }
    }

    static formatFiatAmount(fiatAmountString, bchAmountString) {
        fiatAmountString = ("" + fiatAmountString); // Guarantee string.

        const isInvalid = window.isNaN(window.parseFloat(fiatAmountString));
        if (isInvalid) { return null; }

        // Prevent Javascript integer/float overflow...
        const maxValue = 4294967296;
        if (window.parseFloat(fiatAmountString) > maxValue) { return null; }

        const decimalSeparator = Util.getDecimalSeparator();
        const thousandsSeparator = Util.getThousandsSeparator();

        const countryIso = App.getCountry();
        const country = App.getCountryData(countryIso);

        const fiatDecimalIndex = fiatAmountString.indexOf(decimalSeparator);
        const fiatDecimalCount = window.Math.min(Util.getDecimalCount(fiatAmountString), country.decimals);

        if (fiatDecimalIndex >= 0) {
            fiatAmountString = fiatAmountString.substring(0, fiatDecimalIndex + fiatDecimalCount + 1);
        }

        const formatOptions = { maximumFractionDigits: country.decimals, minimumFractionDigits: fiatDecimalCount };
        let fiatDisplayString = window.parseFloat(fiatAmountString).toLocaleString(undefined, formatOptions);

        const fiatDisplayStringDecimalIndex = fiatDisplayString.indexOf(decimalSeparator);
        if (fiatDisplayStringDecimalIndex < 0 && fiatDecimalIndex >= 0) {
            fiatDisplayString += decimalSeparator;
        }

        let bchAmountFloat = null;
        if (! bchAmountString) {
            const fiatAmountFloat = window.parseFloat(fiatAmountString);
            const exchangeRate = App.getExchangeRate();
            bchAmountFloat = (fiatAmountFloat / exchangeRate);
        }
        else {
            bchAmountFloat = window.parseFloat(bchAmountString);
        }

        const bchFormatOptions = { maximumFractionDigits: 8, minimumFractionDigits: 8 };
        const bchDisplayString = bchAmountFloat.toLocaleString(undefined, bchFormatOptions);
        const bchValue = bchAmountFloat.toFixed(8);

        return {
            fiatValue: fiatAmountString,
            bchValue: bchValue,

            fiat: fiatDisplayString,
            bch: bchDisplayString
        };
    }

    static displayToast(text, isError, duration) {
        duration = duration || 3000;

        const toastElement = document.getElementById("toast");
        toastElement.textContent = text;

        if (isError) {
            toast.classList.add("error");
        }
        else {
            toast.classList.remove("error");
        }

        toast.classList.remove("hidden");

        window.clearTimeout(App._toastTimeout);
        App._toastTimeout = window.setTimeout(function() {
            toast.classList.add("hidden");
        }, duration);
    }

    static getString(screen, field) {
        const errorString = (screen + "." + field);

        const language = App.getLanguage();
        const strings = App._strings[language] || App._strings["english"];
        if (strings == null) { return errorString; }

        const screenStrings = strings[screen];
        if (screenStrings == null) { return errorString; }

        const fieldString = screenStrings[field];
        if (fieldString == null) { return errorString; }

        return fieldString;
    }

    static main() {
        const main = document.getElementById("main");
        
        const pin = App.getPin();
        if (pin.length == 0) {
            const pinScreen = PinScreen.create();
            pinScreen.onComplete = function(value) {
                App.setPin(value);

                const settingsScreen = SettingsScreen.create();
                App.setScreen(settingsScreen);
            };

            App.setScreen(pinScreen);

            window.setTimeout(function() {
                pinScreen.focus();
            }, 0);
        }
        else {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        }
    }
}

App.addOnLoad(function() {
    window.setTimeout(async function() {
        App._sha256 = await window.libauth.instantiateSha256();
    }, 0);

    App.updateExchangeRate();
    App.updateExchangeRate.timeout = window.setInterval(function() {
        App.updateExchangeRate();
    }, (2 * 60 * 1000));
});

App.addOnLoad(function() {
    window.setTimeout(function() {
        App.main();
    }, 0);
});
