class TransactionsScreen {
    static createCompletedPaymentItem(fiatAmount, bchAmount, timestamp) {
        const template = TransactionsScreen.paymentItemTemplate;
        const widget = template.cloneNode(true);

        const fiatAmountElement = widget.querySelector(".amount-fiat");
        const bchAmountElement = widget.querySelector(".amount-bch");
        const timestampElement = widget.querySelector(".timestamp");

        fiatAmountElement.textContent = fiatAmount;
        bchAmountElement.textContent = bchAmount;
        timestampElement.textContent = timestamp;

        return widget;
    }

    static create() {
        const template = TransactionsScreen.template;
        const widget = template.cloneNode(true);

        // Back Button
        const navigationContainer = widget.querySelector(".navigation-container");
        navigationContainer.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        const completedPayments = App.getCompletedPayments();
        if (completedPayments.length == 0) {
        }
        else {
        }

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    TransactionsScreen.template = templates.querySelector(".transactions-screen");
    TransactionsScreen.paymentItemTemplate = templates.querySelector(".completed-payment-item");
});
