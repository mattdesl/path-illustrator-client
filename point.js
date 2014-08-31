function Point(position) {
    this.position = position || [0, 0]
    this.controls = [ [0, 0], [0, 0] ]
    this.curve = false
}

module.exports = Point