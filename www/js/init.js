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
}

window.setTimeout(function() {
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
