"use strict";
class TransactionsScreen {
    static createCompletedPaymentItem(fiatAmount, bchAmountSatoshis, timestamp) {
        const template = TransactionsScreen.paymentItemTemplate;
        const widget = template.cloneNode(true);

        const fiatAmountElement = widget.querySelector(".amount-fiat");
        const bchAmountElement = widget.querySelector(".amount-bch");
        const timestampElement = widget.querySelector(".timestamp");

        const bchAmount = Util.fromSatoshis(bchAmountSatoshis);
        const paymentAmounts = App.formatFiatAmount(fiatAmount, bchAmount);

        fiatAmountElement.textContent = App.getCurrencySymbol() + paymentAmounts.fiat;
        bchAmountElement.textContent = paymentAmounts.bch + " BCH";
        timestampElement.textContent = (new window.Date(timestamp * 1000)).toLocaleString();

        return widget;
    }

    static create() {
        const template = TransactionsScreen.template;
        const widget = template.cloneNode(true);

        const completedPaymentsListElement = widget.querySelector(".completed-payments-list");

        // Back Button
        const navigationContainer = widget.querySelector(".navigation-container");
        navigationContainer.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        const navigationContainerText = navigationContainer.querySelector(".text");
        navigationContainerText.textContent = App.getString("transactions-screen", "title");

        const completedPayments = App.getCompletedPayments();
        if (completedPayments.length == 0) {
            completedPaymentsListElement.textContent = App.getString("transactions-screen", "empty");
        }
        else {
            for (let i = 0; i < completedPayments.length; i += 1) {
                const index = (completedPayments.length - i - 1); // Reverse order...
                const completedPayment = completedPayments[index];
                const itemElement = TransactionsScreen.createCompletedPaymentItem(completedPayment.fiatAmount, completedPayment.amount, completedPayment.timeCompleted);
                completedPaymentsListElement.appendChild(itemElement);
            }
        }

        const printButton = widget.querySelector(".print");
        printButton.onclick = function() {
            console.log("print");
            window.print();
        };

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    TransactionsScreen.template = templates.querySelector(".transactions-screen");
    TransactionsScreen.paymentItemTemplate = templates.querySelector(".completed-payment-item");
});
