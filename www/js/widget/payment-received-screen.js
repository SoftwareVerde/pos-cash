"use strict";
class PaymentReceivedScreen {
    static create(amount) {
        const template = PaymentReceivedScreen.template;
        const widget = template.cloneNode(true);

        const successLabel = widget.querySelector(".success-label");
        const doneButton = widget.querySelector(".done-button");

        successLabel.textContent = App.getString("payment-received-screen", "success-label");
        doneButton.textContent = App.getString("payment-received-screen", "done-button");

        doneButton.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        window.setTimeout(function() {
            const audio = new Audio("/dat/payment.mp3");
            audio.play();
        }, 0);

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    PaymentReceivedScreen.template = templates.querySelector(".payment-received-screen");
});

