class PinWidget {
    static create(onCompleteCallback) {
        const template = PinWidget.template;
        const widget = template.cloneNode(true);

        const inputs = widget.querySelectorAll(".pin-input input");

        const clearInputsAfter = function(index) {
            for (let i = (index + 1); i < inputs.length; i += 1) {
                const input = inputs[i];
                input.value = "";
            }
        };

        for (let i = 0; i < inputs.length; i += 1) {
            const input = inputs[i];
            const previousInput = ( ((i - 1) >= 0) ? inputs[i - 1] : null );
            const nextInput = ( ((i + 1) < inputs.length) ? inputs[i + 1] : null );
            input.onkeyup = function(event) {
                event = event || window.event;

                if (event.keyCode == Util.KeyCodes.delete) {
                    if (input.value.length > 0) {
                        input.value = "";
                    }
                    else if (previousInput != null) {
                        previousInput.value = "";
                        previousInput.focus();
                    }

                    clearInputsAfter(i);
                }
            };
            input.onkeypress = function(event) {
                event = event || window.event;

                const value = window.parseInt(event.key);
                if (window.isNaN(value)) {
                    Util.cancelEvent(event);
                    input.value = "";
                    clearInputsAfter(i);

                    return false;
                }

                input.value = value; // Always overwrite the value in case an existing value is present.
                clearInputsAfter(i);

                if (nextInput != null) {
                    window.setTimeout(function() {
                        nextInput.focus();
                    });
                }
                else {
                    const callback = widget.onComplete;
                    if (typeof callback == "function") {
                        const value = widget.getValue();
                        window.setTimeout(function() {
                            callback(value);
                        });
                    }
                }

                return true;
            };
            input.onfocus = function(event) {
                if (previousInput == null) { return; }
                if (previousInput.value.length == 0) {
                    input.value = "";

                    window.setTimeout(function() {
                        previousInput.focus();
                    });
                }
            };
        }

        widget.focus = function() {
            inputs[0].focus();
        };

        widget.getValue = function() {
            let value = "";
            for (let i = 0; i < inputs.length; i += 1) {
                const input = inputs[i];
                value += input.value;
            }
            return value;
        };

        widget.onComplete = onCompleteCallback;

        widget.setLabel = function(value) {
            const label = widget.querySelector(".pin-label");
            label.textContent = value;
        };

        widget.clear = function() {
            clearInputsAfter(-1);
        };

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");;
    PinWidget.template = templates.querySelector(".pin");
}, 0);
