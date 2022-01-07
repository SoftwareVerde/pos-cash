class CheckoutScreen {
    static create() {
        const template = CheckoutScreen.template;
        const widget = template.cloneNode(true);

        const menuWidget = Menu.create();
        const menuContainer = widget.querySelector(".menu-container");
        menuContainer.appendChild(menuWidget);
        menuWidget.close();

        widget.menu = menuWidget;

        const amountElement = widget.querySelector(".checkout-amount");

        // Create a hidden-input for mobile keyboard...
        const inputDiv = document.createElement("div");
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "number";
        inputDiv.appendChild(hiddenInput);
        inputDiv.classList.add("hidden-input");
        hiddenInput.onkeyup = function(event) {
            widget.setAmount(hiddenInput.value);
        };
        widget.appendChild(inputDiv);
        amountElement.onclick = function() {
            hiddenInput.click();
            hiddenInput.focus();
        };

        const getDecimalCount = function(amount) {
            const decimalSeparator = Util.getDecimalSeparator();
            const amountString = amount;
            const decimalIndex = amountString.indexOf(decimalSeparator);
            if (decimalIndex < 0) { return 0; }

            return (amountString.length - decimalIndex - 1);
        };

        widget.amount = "0";
        widget.setAmount = function(amount) {
            const isInvalid = window.isNaN(window.parseFloat(amount));
            if (isInvalid) { return; }

            let stringAmount = "" + amount;

            // Prevent Javascript integer/float overflow...
            const maxValue = 4294967296;
            if (window.parseFloat(stringAmount) > maxValue) {
                stringAmount = "" + widget.amount;
            }

            const decimalSeparator = Util.getDecimalSeparator();
            const thousandsSeparator = Util.getThousandsSeparator();

            const countryIso = App.getCountry();
            const country = App.getCountryData(countryIso);

            const decimalIndex = stringAmount.indexOf(decimalSeparator);
            const decimalCount = window.Math.min(getDecimalCount(stringAmount), country.decimals);

            if (decimalIndex >= 0) {
                stringAmount = stringAmount.substring(0, decimalIndex + decimalCount + 1);
            }

            const formatOptions = { maximumFractionDigits: country.decimals, minimumFractionDigits: decimalCount };
            let displayString = window.parseFloat(stringAmount).toLocaleString(undefined, formatOptions);

            const displayStringDecimalIndex = displayString.indexOf(decimalSeparator);
            if (displayStringDecimalIndex < 0 && decimalIndex >= 0) {
                displayString += decimalSeparator;
            }

            amountElement.textContent = "$" + displayString;

            widget.amount = stringAmount;
        };

        window.onkeydown = function(event) {
            event = event || window.event;

            let amountString = widget.amount;
            if (event.keyCode == Util.KeyCodes.delete) {
                if (amountString.length <= 1) {
                    amountString = "0";
                }
                else {
                    amountString = amountString.substr(0, amountString.length - 1);
                }

                widget.setAmount(amountString);
            }
        };
        window.onkeypress = function(event) {
            event = event || window.event;

            const key = event.key;
            const amountString = widget.amount;

            const decimalSeparator = Util.getDecimalSeparator();
            if (key == decimalSeparator) {
                if (amountString.indexOf(key) < 0) {
                    widget.setAmount(amountString + key);
                }
            }
            else {
                const digit = window.parseInt(key);
                if (window.isNaN(digit)) { return; }

                widget.setAmount(amountString + digit);
            }
        };

        widget.unload = function() {
            window.onkeypress = null;
            window.onkeydown = null;
        };

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    CheckoutScreen.template = templates.querySelector(".checkout-screen");
}, 0);
