var insideCircle = require('point-circle-collision')
var tmp = [0, 0]
var nearest = [0, 0]

var copy = require('vectors/copy')(2)

//Should use adaptive curves instead of fixed steps:
//http://antigrain.com/research/adaptive_bezier/    

function distSq(point, circle) {
    var dx = circle[0] - point[0]
    var dy = circle[1] - point[1]
    return dx * dx + dy * dy
}

module.exports.bezier = function alongBezier(start, c1, c2, end, point, radius, steps) {
    var x1 = start[0],
        y1 = start[1],
        x2 = c1[0],
        y2 = c1[1],
        x3 = c2[0],
        y3 = c2[1],
        x4 = end[0],
        y4 = end[1],
        minDist = Number.MAX_VALUE,
        hasPoint = false

    for (var i=0; i<steps; i++) {
        var t = i / (steps-1)
        var dt = (1 - t)
        
        var dt2 = dt * dt
        var dt3 = dt2 * dt
        var t2 = t * t
        var t3 = t2 * t
        
        tmp[0] = dt3 * x1 + 3 * dt2 * t * x2 + 3 * dt * t2 * x3 + t3 * x4
        tmp[1] = dt3 * y1 + 3 * dt2 * t * y2 + 3 * dt * t2 * y3 + t3 * y4
        
        var distFromCircleSq = distSq(point, tmp)
        if (distFromCircleSq < radius*radius && distFromCircleSq < minDist) {
            hasPoint = true
            nearest[0] = tmp[0]
            nearest[1] = tmp[1]
            minDist = distFromCircleSq
        }
    }
    if (hasPoint)
        return copy(nearest)
    return null
}

module.exports.quadratic = function alongQuadratic(start, c1, end, point, radius, steps) {
    var x1 = start[0],
        y1 = start[1],
        x2 = c1[0],
        y2 = c1[1],
        x3 = end[0],
        y3 = end[1],
        minDist = Number.MAX_VALUE,
        hasPoint = false

    for (var i=0; i<steps; i++) {
        var t = i / (steps-1)
        var dt = (1 - t)
        var dtSq = dt * dt
        var tSq = t * t
        
        tmp[0] = dtSq * x1 + 2 * dt * t * x2 + tSq * x3
        tmp[1] = dtSq * y1 + 2 * dt * t * y2 + tSq * y3
        
        var distFromCircleSq = distSq(point, tmp)
        if (distFromCircleSq < radius*radius && distFromCircleSq < minDist) {
            hasPoint = true
            nearest[0] = tmp[0]
            nearest[1] = tmp[1]
            minDist = distFromCircleSq
        }
    }
    if (hasPoint)
        return copy(nearest)
    return null
}