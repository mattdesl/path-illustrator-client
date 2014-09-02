function History(size) {
    if (!(this instanceof History))
        return new History(size)
    this.size = typeof size === 'number' ? size : 40
    this.stack = []
    this.index = 0
}

//adds a new history state
//if we are not at index 0, this will destroy all 
//states between 0 and N
History.prototype.push = function(state) {
    //destroy old states
    if (this.index > 0) {
        this.stack.splice(0, this.index)
        this.index = 0
    }

    //insert at start of array
    if (this.stack.length < this.size)
        this.stack.unshift(state)
    //remove end first, then insert at start
    else {
        this.stack.pop()
        this.stack.unshift(state)
    }
}

//moves up 1 and returns that state
History.prototype.undo = function() {
    this.index++
    var max = Math.min(this.stack.length, this.size)
    if (this.index > max-1)
        this.index = max-1
    return this.stack[this.index]
}

//moves down 1 and returns that state
History.prototype.redo = function() {
    this.index--
    if (this.index<0)
        this.index = 0
    return this.stack[this.index]
}

History.prototype.reset = function() {
    this.index = 0
    this.stack.length = 0
}

History.prototype.toString = function() {
    return this.stack.slice().reverse().map(function(info) {
        return (info && info.type) || info
    }).join(', ')
}

module.exports = History
