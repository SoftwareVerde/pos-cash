"use strict";
class QrCodeScanner {
    static stop() {
        const state = QrCodeScanner._state;
        if (! state.isScanning) { return; }

        state.isScanning = false;

        const srcObject = state.video.srcObject;
        const tracks = (srcObject ? srcObject.getTracks() : null) || [];
        for (let i = 0; i < tracks.length; i += 1) {
            const track = tracks[i];
            track.stop();
        }
        state.video.srcObject = null;
        state.video.pause();

        state.canvasContext.clearRect(0, 0, state.canvasElement.width, state.canvasElement.height);

        QrCodeScanner._state = { };
    }

    static start(renderDestination, callback) {
        const video = document.createElement("video");
        const canvasElement = document.createElement("canvas");
        const canvasContext = canvasElement.getContext("2d");

        canvasContext.imageSmoothingEnabled = false;
        renderDestination.appendChild(video);
        video.width = renderDestination.clientWidth;
        video.height = renderDestination.clientHeight;

        const state = QrCodeScanner._state;
        state.video = video;
        state.canvasElement = canvasElement;
        state.canvasContext = canvasContext;

        const onNewFrame = function() {
            if (! state.isScanning) { return; }

            window.setTimeout(function() {
                requestAnimationFrame(onNewFrame);
            }, 0);

            if (video.readyState !== video.HAVE_ENOUGH_DATA) { return; }
            if (video.videoHeight <= 0 || video.videoWidth <= 0) { return; }

            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvasContext.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

            const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = window.jsqr(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

            if (! code) { return; }

            window.setTimeout(function() {
                callback(code.data);
            }, 0);
        };

        // Start the video.
        state.isScanning = true;
        const mediaDevices = window.navigator.mediaDevices;
        if (! mediaDevices) {
            console.log("Camera is not available.");
            window.setTimeout(function() {
                callback(null);
            }, 0);
            return;
        }

        const mediaPromise = mediaDevices.getUserMedia({ video: { } });
        mediaPromise.then(function(stream) {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();

            requestAnimationFrame(onNewFrame)
        });
        mediaPromise.catch(function(exception) {
            console.log("Camera permission is not granted.");
            window.setTimeout(function() {
                callback(null);
            }, 0);
        });
    }

}

(function() {
    QrCodeScanner._state = { };
})();
