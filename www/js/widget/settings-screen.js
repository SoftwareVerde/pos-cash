class SettingsScreen {
    static createEditDialog(dialogTemplate, settingWidget) {
        const dialogWidget = dialogTemplate.cloneNode(true);

        const dialogTitle = dialogWidget.querySelector(".dialog-label");
        dialogTitle.textContent = settingWidget.getLabel();

        const dialogInput = dialogWidget.querySelector(".dialog-input");
        dialogWidget.onComplete = null;

        const confirmButton = dialogWidget.querySelector(".button.confirm");
        confirmButton.onclick = function(event) {
            const value = dialogInput.value.trim();
            const isAllowed = (dialogWidget.onComplete ? (dialogWidget.onComplete(value) !== false) : true);
            if (isAllowed) {
                dialogWidget.remove();
            }
        };

        const cancelButton = dialogWidget.querySelector(".button.cancel");
        cancelButton.onclick = function(event) {
            const isAllowed = (dialogWidget.onCancel ? (dialogWidget.onCancel() !== false) : true);
            if (isAllowed) {
                dialogWidget.remove();
            }
        };

        dialogInput.onkeyup = function(event) {
            event = event || window.event;
            const keyCode = event.keyCode;

            if (keyCode == Util.KeyCodes.enter) {
                confirmButton.click();
            }
            else if (keyCode == Util.KeyCodes.escape) {
                cancelButton.click();
            }
        };
        dialogInput.value = settingWidget.getValue() || "";
        window.setTimeout(function() {
            dialogInput.focus();
        });
        dialogWidget.onclick = function(event) {
            dialogInput.focus();
        };

        return dialogWidget;
    }

    static create() {
        const template = SettingsScreen.template;
        const widget = template.cloneNode(true);

        widget.addWidget = function(subWidget) {
            const subWidgetContainer = widget.querySelector(".active-widget");
            subWidgetContainer.appendChild(subWidget);
        };

        const clearDialog = function() {
            const dialogs = widget.querySelectorAll(".settings-screen-dialog");
            for (let i = 0; i < dialogs.length; i += 1) {
                const dialog = dialogs[i];
                dialog.remove();
            }
        };

        // Merchant Name Setting Widget
        const merchantName = App.getMerchantName();
        const merchantNameSetting = Setting.create("Merchant Name", "/img/merchant.png", merchantName);
        merchantNameSetting.onClick = function() {
            const dialogTemplate = SettingsScreen.editMerchantDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, merchantNameSetting);
            dialogWidget.onComplete = function(value) {
                merchantNameSetting.setValue(value);
                merchantNameSetting.setDisplayValue(value || "...");
                App.setMerchantName(value);
            };

            clearDialog();
            widget.appendChild(dialogWidget);
        };
        widget.addWidget(merchantNameSetting);

        // Destination Address Setting Widget
        const destinationAddress = App.getDestinationAddress() || "...";
        const destinationAddressSetting = Setting.create("Destination Address", "/img/address.png", destinationAddress);
        destinationAddressSetting.onClick = function() {
            const dialogTemplate = SettingsScreen.editDestinationAddressDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, destinationAddressSetting);
            dialogWidget.onComplete = function(value) {
                destinationAddressSetting.setValue(value);
                destinationAddressSetting.setDisplayValue(value || "...");
                App.setDestinationAddress(value);
            };

            clearDialog();
            widget.appendChild(dialogWidget);
        };
        widget.addWidget(destinationAddressSetting);

        // Local Currency Setting Widget
        const localCurrencySetting = Setting.create("Local Currency", "/img/currency.png", "US USD");
        widget.addWidget(localCurrencySetting);

        // PIN Code Setting Widget
        const pinSetting = Setting.create("PIN Code", "/img/pin.png", "####");
        pinSetting.onClick = function() {
            widget.remove();

            const pinScreen = PinScreen.create();
            pinScreen.onComplete = function(value) {
                App.setPin(value);

                const settingsScreen = SettingsScreen.create();
                App.setScreen(settingsScreen);
            };

            App.setScreen(pinScreen);

            window.setTimeout(function() {
                pinScreen.focus();
            });
        };
        widget.addWidget(pinSetting);

        // Multi-terminal Setting Widget
        const multiTerminalSetting = Setting.create("Multi-terminal", "/img/terminal.png", "Disabled");
        widget.addWidget(multiTerminalSetting);

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    SettingsScreen.template = templates.querySelector(".settings-screen");
    SettingsScreen.editMerchantDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-merchant");
    SettingsScreen.editDestinationAddressDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-destination-address");
}, 0);
