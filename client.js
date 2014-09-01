var events = require('dom-events')
var tools = require('./tools')

function passEvent(name, ev) {
    if (this.tool) {
        this.tool[name](ev, this.paths)
    }
}

function PathClient(paths, opt) {
    if (!(this instanceof PathClient))
        return new PathClient(paths, opt)

    opt = opt||{}

    this.paths = paths
    this._tool = null
    
    if (opt.element) {
        ;['mousedown', 'mouseup', 'mousemove'].forEach(function(name) {
            events.on(opt.element, name, passEvent.bind(this, name))
        }.bind(this))
    }
}

Object.defineProperty(PathClient.prototype, "tool", {
    get: function() {
        return this._tool 
    },
    set: function(tool) {
        this._tool = tool
        this.tool.setup(this.paths)
    }
})

module.exports = PathClient