"use strict";
class PaymentScreen {
    static create(fiatAmountString) {
        const template = PaymentScreen.template;
        const widget = template.cloneNode(true);

        widget.fiatAmountString = fiatAmountString;

        const fiatAmountElement = widget.querySelector(".payment-amount");
        const bchAmountElement = widget.querySelector(".payment-amount-bch");
        const labelElement = widget.querySelector(".payment-label");
        const qrCodeElement = widget.querySelector(".qr-code");
        const cancelButton = widget.querySelector(".cancel-button");

        labelElement.textContent = App.getString("payment-screen", "payment-label");

        const destinationAddress = App.getDestinationAddress();
        const cashAddress = App.convertToCashAddress(destinationAddress);

        const displayAmounts = App.formatFiatAmount(fiatAmountString);

        fiatAmountElement.textContent = App.getCurrencySymbol() + displayAmounts.fiat;
        bchAmountElement.textContent = displayAmounts.bch + " BCH";

        const merchantName = App.getMerchantName();
        const paymentLabel = window.encodeURIComponent(merchantName);
        const qrCodeContent = cashAddress + "?amount=" + displayAmounts.bchValue + "&label=" + paymentLabel;
        const qrCode = Util.createQrCode(qrCodeContent);
        qrCodeElement.appendChild(qrCode);

        qrCodeElement.onclick = function() {
            Util.copyToClipboard(qrCodeContent);
            App.displayToast(App.getString("payment-screen", "toast-copy-payment"), false, 1000);
        };

        cancelButton.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        const satoshiAmount = Util.toSatoshis(displayAmounts.bchValue);
        const fiatValue = window.parseFloat(displayAmounts.fiatValue);
        App.waitForPayment(satoshiAmount, fiatValue);
        App.listenForTransactions();

        widget.unload = function() {
            App.stopListeningForTransactions();
            App.waitForPayment(null);
        };

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    PaymentScreen.template = templates.querySelector(".payment-screen");
});
