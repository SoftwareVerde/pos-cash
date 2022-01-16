"use strict";
class PinScreen {
    static create(onCompleteCallback) {
        const template = PinScreen.template;
        const widget = template.cloneNode(true);

        const keyboardContainer = widget.querySelector(".keyboard-container");

        const pinWidget = PinWidget.create();
        const confirmPinWidget = PinWidget.create();
        const keyboardWidget = Keyboard.create();

        pinWidget.setLabel(App.getString("pin-screen", "pin-label"));

        keyboardWidget.onButtonPressed = function(value) {
            const pinWidget = widget.activeWidget;
            if (pinWidget && pinWidget.onButtonPressed) {
                pinWidget.onButtonPressed(value);
            }
        };
        keyboardContainer.appendChild(keyboardWidget);

        confirmPinWidget.setLabel(App.getString("pin-screen", "confirm-pin-label"));
        confirmPinWidget.onComplete = function(value) {
            const firstValue = pinWidget.getValue();
            const expectedValue = App.hash(firstValue);
            if (expectedValue !== value) {
                pinWidget.clear();
                confirmPinWidget.clear();

                widget.displayError("Enter two matching 4-digit PIN codes.");
                widget.setActiveWidget(pinWidget);
                pinWidget.focus();

                return;
            }

            const callback = widget.onComplete;
            if (typeof callback == "function") {
                callback(value);
            }
        };

        pinWidget.onComplete = function(value) {
            widget.setActiveWidget(confirmPinWidget);
            confirmPinWidget.focus();
        };

        widget.onComplete = onCompleteCallback;

        widget.setActiveWidget = function(subWidget) {
            widget.activeWidget = subWidget;

            const subWidgetContainer = widget.querySelector(".active-widget");
            while (subWidgetContainer.firstChild) {
                subWidgetContainer.removeChild(subWidgetContainer.firstChild);
            }
            subWidgetContainer.appendChild(subWidget);
        };

        widget.displayError = function(errorMessage) {
            const errorWidget = widget.querySelector(".error-message");

            errorWidget.textContent = errorMessage;
            errorWidget.classList.remove("hidden");

            window.clearTimeout(widget.displayError.timeout);
            widget.displayError.timeout = window.setTimeout(function() {
                errorWidget.classList.add("hidden");
            }, 3000);
        };

        widget.focus = function() {
            if (! widget.activeWidget) { return; }
            widget.activeWidget.focus();
        };

        widget.setActiveWidget(pinWidget);

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    PinScreen.template = templates.querySelector(".pin-screen");
});
