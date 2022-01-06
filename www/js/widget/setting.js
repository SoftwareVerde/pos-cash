class Setting {
    static create(title, iconUrl, displayValue) {
        const template = Setting.template;
        const widget = template.cloneNode(true);

        widget.setLabel = function(title) {
            const label = widget.querySelector(".setting-label");
            label.textContent = title;
        };

        widget.setIcon = function(iconUrl) {
            const icon = widget.querySelector(".setting-icon");
            icon.src = iconUrl;
        };

        widget.setDisplayValue = function(displayValue) {
            const value = widget.querySelector(".setting-value");
            value.textContent = displayValue;
        };

        widget.onclick = function(event) {
            event = event || window.event;

            // TODO
        };

        widget.setLabel(title);
        widget.setIcon(iconUrl);
        widget.setDisplayValue(displayValue);

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    Setting.template = templates.querySelector(".setting");
}, 0);
