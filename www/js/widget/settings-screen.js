class SettingsScreen {
    static createEditDialog(dialogTemplate, label, value, text) {
        const dialogWidget = dialogTemplate.cloneNode(true);

        const dialogTitle = dialogWidget.querySelector(".dialog-label");
        dialogTitle.textContent = label || "";

        const textElement = dialogWidget.querySelector(".text");
        if (textElement) {
            textElement.textContent = text || "";
        }

        const dialogInput = dialogWidget.querySelector(".dialog-input");
        dialogWidget.onComplete = null;

        const confirmButton = dialogWidget.querySelector(".button.confirm");
        if (confirmButton) {
            confirmButton.onclick = function(event) {
                const value = (dialogInput ? dialogInput.value.trim() : null);
                const isAllowed = (dialogWidget.onComplete ? (dialogWidget.onComplete(value) !== false) : true);
                if (isAllowed) {
                    dialogWidget.remove();

                    if (typeof dialogWidget.onClose == "function") {
                        dialogWidget.onClose();
                    }
                }
            };
        }

        const cancelButton = dialogWidget.querySelector(".button.cancel");
        if (cancelButton) {
            cancelButton.onclick = function(event) {
                const isAllowed = (dialogWidget.onCancel ? (dialogWidget.onCancel() !== false) : true);
                if (isAllowed) {
                    dialogWidget.remove();

                    if (typeof dialogWidget.onClose == "function") {
                        dialogWidget.onClose();
                    }
                }
            };
        }

        if (dialogInput) {
            dialogInput.onkeyup = function(event) {
                event = event || window.event;
                const keyCode = event.keyCode;

                if (keyCode == Util.KeyCodes.enter) {
                    if (confirmButton) {
                        confirmButton.click();
                    }
                }
                else if (keyCode == Util.KeyCodes.escape) {
                    if (cancelButton) {
                        cancelButton.click();
                    }
                }
            };
            dialogInput.value = value || "";
            window.setTimeout(function() {
                dialogInput.focus();
            });
            dialogWidget.onclick = function(event) {
                dialogInput.focus();
            };
        }

        return dialogWidget;
    }

    static create() {
        const template = SettingsScreen.template;
        const widget = template.cloneNode(true);

        const closeDialogOnEscape = function(dialogWidget) {
            window.onkeyup = function(event) {
                event = event || window.event;

                const keyCode = event.keyCode;
                if (keyCode == Util.KeyCodes.escape) {
                    clearDialog();
                    window.onkeyup = null;
                }
            };
            dialogWidget.onClose = function() {
                window.onkeyup = null; // Unset the global onkeypress.
            };

        };

        const clearDialog = function() {
            const dialogs = widget.querySelectorAll(".settings-screen-dialog");
            for (let i = 0; i < dialogs.length; i += 1) {
                const dialog = dialogs[i];
                dialog.remove();

                if (typeof dialog.onClose == "function") {
                    dialog.onClose();
                }
            }
        };

        widget.addWidget = function(subWidget) {
            const subWidgetContainer = widget.querySelector(".active-widget");
            subWidgetContainer.appendChild(subWidget);
        };

        // Merchant Name Setting Widget
        const merchantName = App.getMerchantName();
        const merchantNameSetting = Setting.create("Merchant Name", "/img/merchant.png", merchantName);
        merchantNameSetting.onClick = function() {
            const label = merchantNameSetting.getLabel();
            const value = merchantNameSetting.getValue();

            const dialogTemplate = SettingsScreen.editMerchantDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, label, value);
            dialogWidget.onComplete = function(value) {
                merchantNameSetting.setValue(value);
                merchantNameSetting.setDisplayValue(value || "...");
                App.setMerchantName(value);
            };

            closeDialogOnEscape(dialogWidget);

            clearDialog();
            widget.appendChild(dialogWidget);
        };
        widget.addWidget(merchantNameSetting);

        // Destination Address Setting Widget
        const destinationAddress = App.getDestinationAddress() || "...";
        const destinationAddressSetting = Setting.create("Destination Address", "/img/address.png", destinationAddress);
        destinationAddressSetting.onClick = function() {
            const label = destinationAddressSetting.getLabel();
            const value = destinationAddressSetting.getValue();

            const dialogTemplate = SettingsScreen.editDestinationAddressDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, label, value);
            dialogWidget.onComplete = function(value) {
                destinationAddressSetting.setValue(value);
                destinationAddressSetting.setDisplayValue(value || "...");
                App.setDestinationAddress(value);
            };

            closeDialogOnEscape(dialogWidget);

            window.onkeyup = function(event) {
                event = event || window.event;

                const keyCode = event.keyCode;
                if (keyCode == Util.KeyCodes.escape) {
                    clearDialog();
                    window.onkeyup = null;
                }
            };
            dialogWidget.onClose = function() {
                window.onkeyup = null; // Unset the global onkeypress.
            };

            clearDialog();
            widget.appendChild(dialogWidget);
        };
        widget.addWidget(destinationAddressSetting);

        // Local Currency Setting Widget
        const currentCountryIso = App.getCountry();
        const currentCountry = App.getCountryData(currentCountryIso) || App.getCountryData("US");
        const localCurrencySetting = Setting.create("Local Currency", "/img/currency.png", "US USD");
        localCurrencySetting.setValue(currentCountry.iso);
        localCurrencySetting.setDisplayValue(currentCountry.iso + " " + currentCountry.currency);
        localCurrencySetting.onClick = function() {
            const label = localCurrencySetting.getLabel();
            const value = localCurrencySetting.getValue();

            const dialogTemplate = SettingsScreen.editLocalCurrencyDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, label, value);

            const currencyList = dialogWidget.querySelector(".currency-list");
            let selectedItem = null;
            const items = [];
            for (let i = 0; i < App.countries.length; i += 1) {
                const country = App.countries[i];

                const itemTemplate = SettingsScreen.currencyListItemTemplate;
                const item = itemTemplate.cloneNode(true);
                item.country = country;

                const countryIcon = item.querySelector(".country-icon");
                const countryNameLabel = item.querySelector(".country-name");
                const currencyLabel = item.querySelector(".currency-name");

                countryIcon.src = "/img/country/iso_" + country.iso.toLowerCase() + ".png";
                countryNameLabel.textContent = country.name;
                currencyLabel.textContent = country.currency;

                item.onclick = function() {
                    localCurrencySetting.setValue(country.iso);
                    localCurrencySetting.setDisplayValue(country.iso + " " + country.currency);
                    App.setCountry(country.iso);

                    clearDialog();
                };

                if (country.iso == currentCountry.iso) {
                    selectedItem = item;
                }

                clearDialog();
                currencyList.appendChild(item);
                items.push(item);
            }

            clearDialog();
            widget.appendChild(dialogWidget);

            if (selectedItem) {
                window.setTimeout(function() {
                    selectedItem.scrollIntoView();
                });
            }

            window.onkeypress = function(event) {
                event = event || window.event;

                const key = (event.key || "").toLowerCase();
                let selectedItem = null;
                for (let i = 0; i < items.length; i += 1) {
                    const item = items[i];
                    const country = item.country;
                    const countryName = country.name.toLowerCase();
                    if (countryName.startsWith(key)) {
                        selectedItem = item;
                        break;
                    }
                }
                if (selectedItem) {
                    selectedItem.scrollIntoView();
                }
            };
            dialogWidget.onClose = function() {
                window.onkeypress = null; // Unset the global onkeypress.
            };

            closeDialogOnEscape(dialogWidget);
        };
        widget.addWidget(localCurrencySetting);

        // PIN Code Setting Widget
        const pinSetting = Setting.create("PIN Code", "/img/pin.png", "####");
        pinSetting.onClick = function() {
            clearDialog();

            widget.remove();

            window.onkeyup = function(event) {
                event = event || window.event;

                const keyCode = event.keyCode;
                if (keyCode == Util.KeyCodes.escape) {
                    const settingsScreen = SettingsScreen.create();
                    App.setScreen(settingsScreen);
                    window.onkeyup = null; // Unset the escape handler.
                }
            };

            const pinScreen = PinScreen.create();
            pinScreen.onComplete = function(value) {
                window.onkeyup = null; // Unset the escape handler.

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
        const multiTerminalIsEnabled = App.isMultiTerminalEnabled();
        const multiTerminalSetting = Setting.create("Multi-terminal", "/img/terminal.png", (multiTerminalIsEnabled ? "Enabled" : "Disabled"));
        multiTerminalSetting.onClick = function() {
            const label = multiTerminalSetting.getLabel();

            const dialogTemplate = SettingsScreen.editMultiTerminalDialogTemplate;
            const dialogWidget = SettingsScreen.createEditDialog(dialogTemplate, label, multiTerminalIsEnabled, "For merchants using the same address across multiple terminals.");
            dialogWidget.onComplete = function() {
                multiTerminalSetting.setValue(true);
                multiTerminalSetting.setDisplayValue("Enabled");
                App.setMultiTerminalIsEnabled(true);
            };

            const disableButton = dialogWidget.querySelector(".disable");
            disableButton.onclick = function() {
                multiTerminalSetting.setValue(false);
                multiTerminalSetting.setDisplayValue("Disabled");
                App.setMultiTerminalIsEnabled(false);

                clearDialog();
            };

            closeDialogOnEscape(dialogWidget);

            clearDialog();
            widget.appendChild(dialogWidget);
        };
        widget.addWidget(multiTerminalSetting);

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    SettingsScreen.template = templates.querySelector(".settings-screen");
    SettingsScreen.editMerchantDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-merchant");
    SettingsScreen.editDestinationAddressDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-destination-address");
    SettingsScreen.editLocalCurrencyDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-local-currency");
    SettingsScreen.currencyListItemTemplate = templates.querySelector(".currency-list-item");
    SettingsScreen.editMultiTerminalDialogTemplate = templates.querySelector(".settings-screen-dialog.edit-multi-terminal");
}, 0);
