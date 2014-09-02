var events = require('dom-events')
var tools = require('./tools')
var History = require('./history')
var deepcopy = require('deepcopy')

function passEvent(name, ev) {
    if (this.tool && this.paths.editable) {
        this.tool[name](ev, this.paths)
    }
}

function PathClient(paths, opt) {
    if (!(this instanceof PathClient))
        return new PathClient(paths, opt)

    opt = opt||{}
    

    this.history = opt.history || History(40)
    this.paths = paths
    this._tool = null

    paths.on('finish-change', function(e) {
        this._pushHistory(e)
    }.bind(this))

    if (opt.element) {
        ;['mousedown', 'mouseup', 'mousemove'].forEach(function(name) {
            events.on(opt.element, name, passEvent.bind(this, name))
        }.bind(this))
    }

    this.resetHistory()
}

PathClient.prototype._pushHistory = function(e) {
    var type = ''
    if (e)
        type = e.type

    var state = deepcopy( this.paths.state() )
    this.history.push( { state: state, type: type } )

    // console.log(this.history.toString())
}

PathClient.prototype.resetHistory = function() {
    this.history.reset()
    this._pushHistory({ type: 'start' })
}

PathClient.prototype.undo = function() {
    var info = this.history.undo()
    this.paths.state(info.state)
}

PathClient.prototype.redo = function() {
    var info = this.history.redo()
    this.paths.state(info.state)
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