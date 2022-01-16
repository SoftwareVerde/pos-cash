"use strict";
class CheckoutScreen {
    static create() {
        const template = CheckoutScreen.template;
        const widget = template.cloneNode(true);

        const menuWidget = Menu.create();
        const menuContainer = widget.querySelector(".menu-container");
        menuContainer.appendChild(menuWidget);
        menuWidget.close();

        widget.menu = menuWidget;
        widget.getFiatAmount = function() {
            return window.parseFloat(widget._fiatAmountString);
        };

        const keyboardContainer = widget.querySelector(".keyboard-container");
        const keyboardWidget = Keyboard.create();
        keyboardWidget.onButtonPressed = function(value) {
            const event = Keyboard.createEvent(value);

            if (window.onkeydown) {
                window.onkeydown(event);
            }
            if (window.onkeyup) {
                window.onkeyup(event);
            }
            if (window.onkeypress) {
                window.onkeypress(event);
            }
        };
        keyboardContainer.appendChild(keyboardWidget);

        const amountElement = widget.querySelector(".checkout-amount");
        const bchAmountElement = widget.querySelector(".checkout-amount-bch");
        const checkoutLabel = widget.querySelector(".checkout-label");
        const checkoutButton = widget.querySelector(".checkout-button");

        checkoutLabel.textContent = App.getString("checkout-screen", "checkout-label");
        checkoutButton.textContent = App.getString("checkout-screen", "checkout-button");

        checkoutButton.onclick = function() {
            if (widget._fiatAmountString <= 0) {
                App.displayToast("Invalid amount.", true);
                App.displayToast(App.getString("checkout-screen", "toast-invalid-amount"), true);
                return;
            }

            const destinationAddress = App.getDestinationAddress();
            if (! destinationAddress) {
                App.displayToast(App.getString("checkout-screen", "toast-invalid-address"), true);
                return;
            }

            const paymentScreen = PaymentScreen.create(widget._fiatAmountString);
            App.setScreen(paymentScreen);
        };

        // Create a hidden-input for mobile keyboard...
        if (Util.isMobile()) {
            const inputDiv = document.createElement("div");
            const hiddenInput = document.createElement("input");
            hiddenInput.type = "number";
            hiddenInput.inputmode = "numeric";
            inputDiv.appendChild(hiddenInput);
            inputDiv.classList.add("hidden-input");
            hiddenInput.onkeyup = function(event) {
                event = event || window.event;
                event.stopPropagation();

                widget.setAmount(hiddenInput.value);
                hiddenInput.value = widget._fiatAmountString;
            };
            amountElement.parentNode.insertBefore(inputDiv, amountElement);
            amountElement.onclick = function() {
                widget.hiddenInput.value = widget._fiatAmountString;
                hiddenInput.click();
                hiddenInput.focus();
            };

            widget.hiddenInput = hiddenInput;
            widget.hiddenTimeout = null;
        }

        widget._fiatAmountString = "0";
        widget.setAmount = function(fiatAmountString) {
            const displayAmounts = App.formatFiatAmount(fiatAmountString);
            if (displayAmounts == null) { return; }

            widget._fiatAmountString = displayAmounts.fiatValue;

            amountElement.textContent = App.getCurrencySymbol() + displayAmounts.fiat;
            bchAmountElement.textContent = displayAmounts.bch + " BCH";
        };

        window.onkeydown = function(event) {
            event = event || window.event;

            let amountString = widget._fiatAmountString;
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
            const amountString = widget._fiatAmountString;

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

        widget.setAmount(widget._fiatAmountString);

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    CheckoutScreen.template = templates.querySelector(".checkout-screen");
});
