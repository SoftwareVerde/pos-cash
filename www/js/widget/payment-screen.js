class PaymentScreen {
    static create(amount) {
        const template = PaymentScreen.template;
        const widget = template.cloneNode(true);

        const countryIso = App.getCountry();
        const country = App.getCountryData(countryIso);

        const amountElement = widget.querySelector(".payment-amount");
        const bchAmountElement = widget.querySelector(".payment-amount-bch");
        const qrCodeElement = widget.querySelector(".qr-code");
        const cancelButton = widget.querySelector(".cancel-button");

        const destinationAddress = App.getDestinationAddress();
        const cashAddress = App.convertToCashAddress(destinationAddress);

        const stringAmount = "" + amount;
        const decimalCount = window.Math.min(Util.getDecimalCount(stringAmount), country.decimals);
        const formatOptions = { maximumFractionDigits: country.decimals, minimumFractionDigits: decimalCount };
        const displayString = window.parseFloat(stringAmount).toLocaleString(undefined, formatOptions);

        amountElement.textContent = "$" + displayString;

        widget.amount = amount;

        const amountFloat = window.parseFloat(widget.amount);
        const exchangeRate = App.getExchangeRate();
        const amountBch = (amountFloat / exchangeRate);
        const bchFormatOptions = { maximumFractionDigits: 8, minimumFractionDigits: 8 };
        const bchDisplayString = amountBch.toLocaleString(undefined, bchFormatOptions);
        bchAmountElement.textContent = bchDisplayString + " BCH";

        const merchantName = App.getMerchantName();
        const paymentLabel = window.encodeURIComponent(merchantName);
        const qrCode = Util.createQrCode(cashAddress + "?amount=" + amountBch + "&label=" + paymentLabel);
        qrCodeElement.appendChild(qrCode);

        cancelButton.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        App.waitForPayment(amount);
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
