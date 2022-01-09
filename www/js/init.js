window.setTimeout(function() {
    const startMs = Date.now();
    App.onLoad();
    const endMs = Date.now();

    const elapsedMs = (endMs - startMs);
    console.log("Initialized in " + elapsedMs + "ms.");
}, 0);
