class Util {
    static cancelEvent(event) {
        if (! event.preventDefault) {
            event.returnValue = false;
            return;
        }
        event.preventDefault();
    }
}

Util.KeyCodes = {};
Util.KeyCodes.escape = 27;
Util.KeyCodes.delete = 8;
Util.KeyCodes.tab = 9;
Util.KeyCodes.enter = 13;
Util.KeyCodes.shift = 16;
