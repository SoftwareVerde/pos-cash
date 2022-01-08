window.MAX_SAFE_INTEGER = window.Number.MAX_SAFE_INTEGER || 9007199254740991;

class Util {
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
        return (amount * 100000000);
    }

    static createQrCode(content) {
        return window.ninja.qrCode.createCanvas(content, 4);
    }
}

Util.KeyCodes = {};
Util.KeyCodes.escape = 27;
Util.KeyCodes.delete = 8;
Util.KeyCodes.tab = 9;
Util.KeyCodes.enter = 13;
Util.KeyCodes.shift = 16;

class App {
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

    static getCountryData(countryIso) {
        for (let i = 0; i < App.countries.length; i += 1) {
            const country = App.countries[i];
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

    static _decodeAddress(addressString) {
        const isValidResult = function(result) {
            return (result && typeof result != "string");
        };

        let result = window.libauth.decodeBase58Address(App.sha256, addressString);
        if (isValidResult(result)) { return result; }

        result = window.libauth.decodeCashAddressFormat(addressString);
        if (isValidResult(result)) { return result; }

        result = window.libauth.decodeCashAddressFormat("bitcoincash:" + addressString);
        if (isValidResult(result)) { return result; }

        return null;
    }

    static isAddressValid(addressString) {
        const address = App._decodeAddress(addressString);
        return (address != null);
    }

    static convertToBase58Address(addressString) {
        const address = App._decodeAddress(addressString);
        if (address == null) { return null; }

        const addressBytes = (address.payload || address.hash);
        return window.libauth.encodeBase58Address(App.sha256, address.version, addressBytes);
    }

    static convertToCashAddress(addressString) {
        const address = App._decodeAddress(addressString);
        if (address == null) { return null; }

        const addressBytes = (address.payload || address.hash);
        return window.libauth.encodeCashAddress("bitcoincash", address.version, addressBytes);
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
        const endpoint = "wss://explorer.bitcoinverde.org/api/v1/announcements";
        const webSocket = new WebSocket(endpoint);

        webSocket.onopen = function() {
            const message = {
                requestId: 1,
                method: "POST",
                query: "SET_ADDRESSES",
                parameters: []
            };
            const destinationAddress = App.getDestinationAddress();
            message.parameters.push(destinationAddress);

            webSocket.send(message);
        };

        webSocket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            const objectType = message.objectType;

            let container = null;
            let element  = null;
            if ( (objectType == "TRANSACTION") || (objectType == "TRANSACTION_HASH") ) {
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

            return false;
        };

        webSocket.onclose = function() {
            console.log("WebSocket closed...");
        };

        if (App._webSocket) {
            App._webSocket.close();
        }
        App._webSocket = webSocket;
    }

    static stopListeningForTransactions() {
        const webSocket = App._webSocket;
        if (webSocket) {
            webSocket.close();

            App._webSocket = null;
        }
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
            pendingPayment.timeCompleted = (Date.now() / 1000);

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
}

App._exchangeRateData = {};
App._webSocket = null;
App._pendingPayment = null;
