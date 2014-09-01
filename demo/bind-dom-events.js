var events = require('dom-events')

module.exports = function(domElement, client) {
    ;['mousedown', 'mouseup', 'mousemove'].forEach(function(n) {
        events.on(domElement, n, function(ev) {
            client.emit(n, ev)
        })
    })
}