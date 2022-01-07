class App {
    static setScreen(screen) {
        const main = document.getElementById("main");
        while (main.firstChild) {
            main.removeChild(main.firstChild);
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
        if (merchantName == null) { return "..."; }

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
        return localStorage.getItem("country");
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

    static isAddressValid(addressString) {
        const isValidResult = function(result) {
            return (result && typeof result != "string");
        };

        let result = window.libauth.decodeBase58Address(App.sha256, addressString);
        if (isValidResult(result)) { return true; }

        result = window.libauth.decodeCashAddressFormat(addressString);
        if (isValidResult(result)) { return true; }

        result = window.libauth.decodeCashAddressFormat("bitcoincash:" + addressString);
        if (isValidResult(result)) { return true; }

        return false;
    }
}

window.setTimeout(function() {
    App.countries = [];
    Http.get("/api/v1/countries.json", "", function(data) {
        App.countries = data;
    });

    App.sha256 = null;
    window.setTimeout(async function() {
        App.sha256 = await window.libauth.instantiateSha256();
    });

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
        });
    }
    else {
        const checkoutScreen = CheckoutScreen.create();
        App.setScreen(checkoutScreen);
    }
}, 0);
