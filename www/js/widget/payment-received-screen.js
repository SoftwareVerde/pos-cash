"use strict";
class PaymentReceivedScreen {
    static create(pendingPayment) {
        const template = PaymentReceivedScreen.template;
        const widget = template.cloneNode(true);

        const successLabel = widget.querySelector(".success-label");
        const failureLabel = widget.querySelector(".failure-label");
        const doneButton = widget.querySelector(".done-button");

        const doubleSpendChecker = widget.querySelector(".double-spend-checker");
        const doubleSpendCountdown = doubleSpendChecker.querySelector(".double-spend-countdown");
        const doubleSpendCheckerLabel = doubleSpendChecker.querySelector(".double-spend-checker-label");        

        const doubleSpendCheckTicker = function() {
            const previousValue = window.parseInt(doubleSpendCountdown.textContent);
            if (previousValue == 0) {
                widget.classList.add("success");
                window.setTimeout(function() {
                    const audio = new Audio("/dat/payment.mp3");
                    audio.play();
                }, 0);

                return;
            }

            const startMs = window.Date.now();
            const transactions = pendingPayment.transactions;
            const checkTransactionsForDoubleSpend  = function(i) {
                if (i >= transactions.length) {
                    const endMs = window.Date.now();
                    const timeWaitedMs = (endMs - startMs);
                    const timeToWaitMs = Math.max(0, (1000 - timeWaitedMs));
                    doubleSpendCountdown.textContent = (previousValue - 1);
                    window.setTimeout(doubleSpendCheckTicker, timeToWaitMs);
                    return;
                }

                const transactionHash = transactions[i];
                App.checkForDoubleSpend(transactionHash, function(wasDoubleSpent) {
                    if (wasDoubleSpent) {
                        widget.classList.add("failure");
                        return;
                    }

                    checkTransactionsForDoubleSpend(i + 1);
                });
            };

            checkTransactionsForDoubleSpend(0);
        };

        if (App.isDoubleSpendCheckEnabled()) {
            window.setTimeout(doubleSpendCheckTicker, 1000);
        }
        else {
            widget.classList.add("success");
            window.setTimeout(function() {
                const audio = new Audio("/dat/payment.mp3");
                audio.play();
            }, 0);
        }

        successLabel.textContent = App.getString("payment-received-screen", "success-label");
        failureLabel.textContent = App.getString("payment-received-screen", "failure-label");
        doneButton.textContent = App.getString("payment-received-screen", "done-button");
        doubleSpendCheckerLabel.textContent = App.getString("payment-received-screen", "double-spend-checker-label");

        doneButton.onclick = function() {
            const checkoutScreen = CheckoutScreen.create();
            App.setScreen(checkoutScreen);
        };

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    PaymentReceivedScreen.template = templates.querySelector(".payment-received-screen");
});

