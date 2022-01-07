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
