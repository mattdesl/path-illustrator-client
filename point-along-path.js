var collide = require('line-circle-collision')
var curve = require('./point-along-curve')


module.exports = function(path, closed, point, radius, nearest) {
    var steps = 100
    
    if (path.length <= 1)
        return -1

    for (var i=0; i<path.length; i++) { 
        var cur = path[i]
        var last = null
        var hit = false
        var curvePoint = null

        if (!closed && i===0)
            continue

        if (closed && i===0) {
            last = path[path.length-1]
        } else
            last = path[i-1]

        if (!last.curve && !cur.curve) {
            hit = collide(last.position, cur.position, point, radius, nearest)
        } else {
            if (last.curve && cur.curve) {
                var c1 = last.controls[1], 
                    c2 = cur.controls[0]
                curvePoint = curve.bezier(last.position, c1, c2, cur.position, point, radius, steps)
            } else {
                if (closed && i===0 && last.curve) {
                    var c1 = last.controls[1]
                    curvePoint = curve.quadratic(last.position, c1, cur.position, point, radius, steps)
                } else {
                    var c1 = last.curve
                        ? last.controls[1] 
                        : cur.controls[0]

                    curvePoint = curve.quadratic(last.position, c1, cur.position, point, radius, steps)
                }
            }
        }

        if (curvePoint) {
            nearest[0] = curvePoint[0]
            nearest[1] = curvePoint[1]
            hit = true
        }

        if (hit)
            return i
    }
    return -1
}