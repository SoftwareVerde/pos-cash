"use strict";
class Keyboard {
    static createEvent(value) {
        const event = {
            key: null,
            keyCode: null
        };

        const decimalSeparator = Util.getDecimalSeparator();
        const intValue = window.parseInt(value);
        if (intValue >= 0) {
            event.key = value;
            event.keyCode = (48 + intValue);
        }
        else if (value == decimalSeparator) {
            event.key = value;
            event.keyCode = (value == "." ? 190 : 188);
        }
        else { // Delete Key
            event.key = null;
            event.keyCode = Util.KeyCodes.delete;
        }

        return event;
    }

    static create(clickCallback) {
        const template = Keyboard.template;
        const widget = template.cloneNode(true);

        widget.onButtonPressed = clickCallback;
        widget.timeout = null;

        const numberButtons = widget.querySelectorAll(".button.number");
        for (let i = 0; i < numberButtons.length; i += 1) {
            const button = numberButtons[i];

            button.onclick = function(event) {
                event = event || window.event;

                const value = window.parseInt(button.innerText);
                if (typeof widget.onButtonPressed == "function") {
                    widget.onButtonPressed(value);
                }
            };
        }

        const decimalButton = widget.querySelector(".button.decimal");
        decimalButton.onclick = function(event) {
            event = event || window.event;

            const value = Util.getDecimalSeparator();
            if (typeof widget.onButtonPressed == "function") {
                widget.onButtonPressed(value);
            }
        };
        decimalButton.textContent = Util.getDecimalSeparator();

        const deleteButton = widget.querySelector(".button.delete");
        deleteButton.onclick = function(event) {
            event = event || window.event;

            const value = "-1";
            if (typeof widget.onButtonPressed == "function") {
                widget.onButtonPressed(value);
            }
        };

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    Keyboard.template = templates.querySelector(".keyboard");
});
