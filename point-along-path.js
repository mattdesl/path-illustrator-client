var collide = require('line-circle-collision')

module.exports = function(path, point, radius, nearest) {
    for (var i=1; i<path.length; i++) {
        if (path[i-1].curve || path[i].curve)
            continue

        var last = path[i-1].position
        var cur = path[i].position

        var hit = collide(last, cur, point, radius, nearest)
        if (hit)
            return i
    }
    return -1
}