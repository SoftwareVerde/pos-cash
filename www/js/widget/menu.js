"use strict";
class Menu {
    static createMenuItem(label, icon, onClickCallback) {
        const template = Menu.itemTemplate;
        const widget = template.cloneNode(true);

        const iconElement = widget.querySelector(".menu-item-icon");
        const labelElement = widget.querySelector(".menu-item-label");

        iconElement.src = icon;
        labelElement.textContent = label;

        widget.onclick = function() {
            if (typeof onClickCallback == "function") {
                onClickCallback();
            }
        };

        return widget;
    }

    static create() {
        const template = Menu.template;
        const widget = template.cloneNode(true);

        const merchantName = widget.querySelector(".menu-content .menu-header .menu-merchant-name");
        merchantName.textContent = App.getMerchantName();

        const menuList = widget.querySelector(".menu-list");

        const transactionsMenuItem = Menu.createMenuItem(App.getString("menu", "transactions"), "/img/transactions.png", function() {
            widget.close();

            const transactionsScreen = TransactionsScreen.create();
            App.setScreen(transactionsScreen);
        })
        menuList.appendChild(transactionsMenuItem);

        const settingsMenuItem = Menu.createMenuItem(App.getString("menu", "settings"), "/img/settings.png", function() {
            widget.close();

            const pinWidget = PinWidget.create(null, true);
            pinWidget.onComplete = function(pin) {
                if (App.getPin() != pin) {
                    App.displayToast(App.getString("menu", "toast-invalid-pin"), true);

                    const checkoutScreen = CheckoutScreen.create();
                    App.setScreen(checkoutScreen);
                    return;
                }

                App.setScreen(null);

                // Add a delay to rendering due to the habit of entering pin too fast and pressing a settings button.
                window.setTimeout(function() {
                    const settingsScreen = SettingsScreen.create();
                    App.setScreen(settingsScreen);
                }, 350);
            };
            pinWidget.setLabel(App.getString("menu", "pin-label"));
            App.setScreen(pinWidget);

            window.setTimeout(function() {
                pinWidget.focus();
            }, 0);
        });
        menuList.appendChild(settingsMenuItem);

        const advertiseMenuItem = Menu.createMenuItem(App.getString("settings-screen", "advertise"), "/img/business.png", function() {
            widget.close();

            window.open("https://map.bitcoin.com/", "_blank").focus();
        });
        advertiseMenuItem.classList.add("advertise");
        menuList.appendChild(advertiseMenuItem);

        const contentElement = widget.querySelector(".menu-content");

        const menuIcon = widget.querySelector(".menu-icon");
        menuIcon.onclick = function() {
            if (widget.isHidden) {
                widget.open();
            }
            else {
                widget.close();
            }
        };

        const closeButton = widget.querySelector(".close-button");
        closeButton.textContent = App.getString("menu", "close-button");
        closeButton.onclick = function() {
            widget.close();
        };

        widget.onclick = function(event) {
            event = event || window.event;

            if (event.target != widget) { return; }
            if (widget.isHidden) { return; }
            widget.close();
        };

        widget.isHidden = null;
        widget.open = function() {
            widget.classList.add("expanded");
            contentElement.classList.remove("hidden");
            menuIcon.classList.add("hidden");

            widget.isHidden = false;

            App.showAttributions(true);
        };

        widget.close = function() {
            widget.classList.remove("expanded");
            contentElement.classList.add("hidden");
            menuIcon.classList.remove("hidden");

            widget.isHidden = true;

            App.showAttributions(false);
        };

        widget.close();

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    Menu.template = templates.querySelector(".menu");
    Menu.itemTemplate = templates.querySelector(".menu-list-item");
});
