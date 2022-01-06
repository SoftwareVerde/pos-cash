class SettingsScreen {
    static create() {
        const template = SettingsScreen.template;
        const widget = template.cloneNode(true);

        widget.addWidget = function(subWidget) {
            const subWidgetContainer = widget.querySelector(".active-widget");
            subWidgetContainer.appendChild(subWidget);
        };

        const merchantNameSetting = Setting.create("Merchant Name", "/img/merchant.png", "...");
        widget.addWidget(merchantNameSetting);

        const destinationAddressSetting = Setting.create("Destination Address", "/img/address.png", "...");
        widget.addWidget(destinationAddressSetting);

        const localCurrencySetting = Setting.create("Local Currency", "/img/currency.png", "US USD");
        widget.addWidget(localCurrencySetting);

        const pinSetting = Setting.create("PIN Code", "/img/pin.png", "####");
        widget.addWidget(pinSetting);

        const multiTerminalSetting = Setting.create("Multi-terminal", "/img/terminal.png", "Disabled");
        widget.addWidget(multiTerminalSetting);

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    SettingsScreen.template = templates.querySelector(".settings-screen");
}, 0);
