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
        menuList.appendChild(Menu.createMenuItem("Transactions", "/img/transactions.png", null));
        menuList.appendChild(Menu.createMenuItem("Settings", "/img/settings.png", function() {
            const settingsScreen = SettingsScreen.create();
            App.setScreen(settingsScreen);
        }));

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

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    Menu.template = templates.querySelector(".menu");
    Menu.itemTemplate = templates.querySelector(".menu-list-item");
}, 0);

