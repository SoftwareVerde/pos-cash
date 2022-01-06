window.setTimeout(function() {
    const main = document.getElementById("main");
    

    const pinScreen = PinScreen.create(function(pin) {
        main.removeChild(main.firstChild);
    });

    main.appendChild(pinScreen);

    window.setTimeout(function() {
        pinScreen.focus();
    });
}, 0);
