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
}

window.setTimeout(function() {
    const main = document.getElementById("main");
    
    const localStorage = window.localStorage;

    const pin = (localStorage.getItem("pin") || "");
    if (pin.length == 0) {
        const pinScreen = PinScreen.create(function(value) {
            localStorage.setItem("pin", value);

            const settingsScreen = SettingsScreen.create();
            App.setScreen(settingsScreen);
        });

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
