"use strict";
class Setting {
    static create(title, iconUrl, displayValue) {
        const template = Setting.template;
        const widget = template.cloneNode(true);

        widget.setLabel = function(title) {
            widget.label = title;

            const label = widget.querySelector(".setting-label");
            label.textContent = title;
        };
        widget.getLabel = function() {
            return widget.label;
        };

        widget.setIcon = function(iconUrl) {
            const icon = widget.querySelector(".setting-icon");
            icon.src = iconUrl;
        };

        widget.setDisplayValue = function(displayValue) {
            const value = widget.querySelector(".setting-value");
            value.textContent = displayValue;
        };

        widget.value = null;
        widget.setValue = function(value) {
            widget.value = value;
        };

        widget.getValue = function() {
            return widget.value;
        };

        widget.onclick = function(event) {
            event = event || window.event;

            const callback = widget.onClick;
            if (typeof callback == "function") {
                callback(widget);
            }
        };

        widget.setLabel(title);
        widget.setIcon(iconUrl);
        widget.setDisplayValue(displayValue);

        return widget;
    }
}

App.addOnLoad(function() {
    const templates = document.getElementById("templates");
    Setting.template = templates.querySelector(".setting");
});
