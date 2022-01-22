"use strict";
window.setTimeout(function() {
    const startMs = window.Date.now();
    App.initialize(function() {
        App.onLoad();
        const endMs = window.Date.now();

        const elapsedMs = (endMs - startMs);
        console.log("Initialized in " + elapsedMs + "ms.");
    });
}, 0);
