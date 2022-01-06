class CheckoutScreen {
    static create() {
        const template = CheckoutScreen.template;
        const widget = template.cloneNode(true);

        return widget;
    }
}

window.setTimeout(function() {
    const templates = document.getElementById("templates");
    CheckoutScreen.template = templates.querySelector(".checkout-screen");
}, 0);
