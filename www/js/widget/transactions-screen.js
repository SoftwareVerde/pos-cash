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

    static getDatePickerValue(container) {
        const dateInput = container.querySelector("input.date");
        if (! dateInput.value) { return null; }

        const hourContainer = container.querySelector(".time-input.hour");
        const hourInput = hourContainer.querySelector("input");

        const minuteContainer = container.querySelector(".time-input.minute");
        const minuteInput = container.querySelector("input.minute");

        return Date.parse(dateInput.value + " " + hourInput.value + ":" + minuteInput.value + ":00 " + (hourInput.isPm ? "PM" : "AM"));
    }

    static createDatePicker(container, onChange) {
        const dateInput = container.querySelector("input.date");
        const ampmToggle = container.querySelector(".ampm-toggle");
        const clearButton = container.querySelector(".clear");
        const pickerContainer = container.querySelector(".picker-container");

        const hourContainer = container.querySelector(".time-input.hour");
        const hourInput = hourContainer.querySelector("input");
        const hourUpButton = hourContainer.querySelector(".up");
        const hourDownButton = hourContainer.querySelector(".down");

        const minuteContainer = container.querySelector(".time-input.minute");
        const minuteInput = container.querySelector("input.minute");
        const minuteUpButton = minuteContainer.querySelector(".up");
        const minuteDownButton = minuteContainer.querySelector(".down");

        clearButton.onclick = function() {
            pickerContainer.classList.add("hidden");
            dateInput.value = "";
            if (onChange) {
                onChange();
            }
        };

        hourUpButton.onclick = function() {
            const value = window.parseInt(hourInput.value);
            const newValue = (value % 12) + 1;
            hourInput.value = (newValue < 10 ? "0" + newValue : newValue);

            if (onChange) {
                onChange();
            }
        };

        hourDownButton.onclick = function() {
            const value = window.parseInt(hourInput.value);
            const newValue = (value > 1 ? (value - 1) : 12);
            hourInput.value = (newValue < 10 ? "0" + newValue : newValue);

            if (onChange) {
                onChange();
            }
        };

        minuteUpButton.onclick = function() {
            const value = window.parseInt(minuteInput.value);
            const newValue = ((value + 5) % 60);
            minuteInput.value = (newValue < 10 ? "0" + newValue : newValue);

            if (onChange) {
                onChange();
            }
        };

        minuteDownButton.onclick = function() {
            const value = window.parseInt(minuteInput.value);
            const newValue = (value > 0 ? (value - 5) : 55);
            minuteInput.value = (newValue < 10 ? "0" + newValue : newValue);

            if (onChange) {
                onChange();
            }
        };

        hourInput.isPm = false;
        ampmToggle.textContent = "AM";

        ampmToggle.onclick = function() {
            hourInput.isPm = (! hourInput.isPm);
            ampmToggle.textContent = (hourInput.isPm ? "PM" : "AM");
            if (onChange) {
                onChange();
            }
        };

        const callback = function() {
            pickerContainer.classList.add("hidden");

            if (onChange) {
                onChange();
            }
        };

        window.picker.attach({target: dateInput, container: pickerContainer, onpick: callback});
        pickerContainer.classList.add("hidden");

        dateInput.onclick = function() {
            pickerContainer.classList.remove("hidden");
        };
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

        const dateFilter = widget.querySelector(".date-filter");
        const startFilter = dateFilter.querySelector(".start");
        const endFilter = dateFilter.querySelector(".end");

        const onFilterChange = function() {
            const startDate = TransactionsScreen.getDatePickerValue(startFilter);
            const endDate = TransactionsScreen.getDatePickerValue(endFilter);

            while (completedPaymentsListElement.firstChild) {
                completedPaymentsListElement.removeChild(completedPaymentsListElement.firstChild);
            }

            const minTime = (startDate != null ? startDate / 1000 : null);
            const maxTime = (endDate != null ? endDate / 1000 : null);

            for (let i = 0; i < completedPayments.length; i += 1) {
                const index = (completedPayments.length - i - 1); // Reverse order...
                const completedPayment = completedPayments[index];
                if ( (minTime == null || completedPayment.timeCompleted >= minTime) && (maxTime == null || completedPayment.timeCompleted <= maxTime) ) {
                    const itemElement = TransactionsScreen.createCompletedPaymentItem(completedPayment.fiatAmount, completedPayment.amount, completedPayment.timeCompleted);
                    completedPaymentsListElement.appendChild(itemElement);
                }
            }
        };

        TransactionsScreen.createDatePicker(startFilter, onFilterChange);
        TransactionsScreen.createDatePicker(endFilter, onFilterChange);

        const printButton = widget.querySelector(".print");
        printButton.onclick = function() {
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
