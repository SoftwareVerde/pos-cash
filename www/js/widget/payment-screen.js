class PaymentScreen {
    static create(fiatAmountString) {
        const template = PaymentScreen.template;
        const widget = template.cloneNode(true);

        const countryIso = App.getCountry();
        const country = App.getCountryData(countryIso);

        const fiatAmountElement = widget.querySelector(".payment-amount");
        const bchAmountElement = widget.querySelector(".payment-amount-bch");
        const qrCodeElement = widget.querySelector(".qr-code");
        const cancelButton = widget.querySelector(".cancel-button");

        const destinationAddress = App.getDestinationAddress();
        const cashAddress = App.convertToCashAddress(destinationAddress);

        const fiatAmount = window.parseFloat(fiatAmountString);
        widget.fiatAmount = fiatAmountString;

        const decimalCount = window.Math.min(Util.getDecimalCount(fiatAmountString), country.decimals);
        const formatOptions = { maximumFractionDigits: country.decimals, minimumFractionDigits: decimalCount };
        const displayString = fiatAmount.toLocaleString(undefined, formatOptions);

        fiatAmountElement.textContent = "$" + displayString;

        const exchangeRate = App.getExchangeRate();
        const bchAmount = (fiatAmount / exchangeRate);
        const bchFormatOptions = { maximumFractionDigits: 8, minimumFractionDigits: 8 };
        const bchDisplayString = bchAmount.toLocaleString(undefined, bchFormatOptions);
        bchAmountElement.textContent = bchDisplayString + " BCH";

        const merchantName = App.getMerchantName();
        const paymentLabel = window.encodeURIComponent(merchantName);
        const qrCode = Util.createQrCode(cashAddress + "?amount=" + bchAmount + "&label=" + paymentLabel);
        qrCodeElement.appendChild(qrCode);

        cancelButton.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        const satoshiAmount = Util.toSatoshis(bchAmount);
        App.waitForPayment(satoshiAmount, fiatAmount);
        App.listenForTransactions();

        widget.unload = function() {
            App.stopListeningForTransactions();
            App.waitForPayment(null);
        };

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    PaymentScreen.template = templates.querySelector(".payment-screen");
}, 0);
