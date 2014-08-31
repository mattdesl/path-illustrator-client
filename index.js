var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var Point = require('./point')

var dist = require('vectors/dist')(2)
var sub = require('vectors/sub')(2)
var norm = require('vectors/normalize')(2)
var add = require('vectors/add')(2)
var copy = require('vectors/copy')(2)
var mult = require('vectors/mult')(2)

function DrawPaths(opt) {
    if (!(this instanceof DrawPaths))
        return new DrawPaths(opt)
    EventEmitter.call(this)
    opt = opt||{}

    this.points = []
    this.activePoint = null

    this.on('place', function(e) {
        this.points.push(new Point(e.position))
    })

    this.on('adjust-curve', function(e) {
        var len = dist(e.position, e.point.position)
        var dir = copy(e.position)

        norm( sub(dir, e.point.position) )
        mult(dir, -1 * len)

        //secondary point
        add(dir, e.point.position)

        if (e.point.controls.length === 1) { //quadratic
            e.point.curve = true
            e.point.controls[0] = dir
        } else if (e.point.controls.length === 2) { //bezier
            e.point.curve = true
            e.point.controls[1] = e.position
            e.point.controls[0] = dir
        } else 
            throw new Error('unsupported curve order '+e.point.controls.length)
    })

    this.hoverDistance = 10
    this.pointRadius = 3
    this.controlRadius = 2
    this.controlAlpha = 0.2
    this.controlStyle = 'blue'
    this.pointStyle = '#2d2d2d'

    // this.on('mouseup', this._updateActive.bind(this))
    this.on('mousemove', this._updateActive.bind(this))

    this.on('close-path', function() {
        if (this.points.length<=1)
            return
        this.closed = true
    }.bind(this))

    this.on('move-active', function(e) {
        var point = this.activePoint
        if (!point)
            return
        if (point.isControl && point.parent) {
            point.parent.controls[ point.index ] = e.position
            point.position = e.position
        } else {
            var old = point.position

            point.position = e.position

            var translate = sub( copy(e.position), old )
            for (var j=0; j<point.controls.length; j++) {
                var c = point.controls[j]
                add( c, translate )
            }
        }
    })
}

inherits(DrawPaths, EventEmitter)

DrawPaths.prototype._updateActive = function(e) {
    //point takes precedence
    var closest = this.nearestPoint(e.position, this.hoverDistance)
    this.activePoint = closest

    if (!closest) {
        this.activePoint = this.nearestControl(e.position, this.hoverDistance)
    }
}

DrawPaths.prototype.nearestPointIndex = function(position, threshold) {
    threshold = typeof threshold === 'number' ? threshold : Number.MAX_VALUE

    var nearestIndex = -1
    var minDist = Number.MAX_VALUE
    for (var i=0; i<this.points.length; i++) {
        var p = this.points[i]
        var distance = dist(p.position, position)
        
        if (distance < minDist && distance < threshold) {
            nearestIndex = i
            minDist = distance
        }
    }
    return nearestIndex
}

DrawPaths.prototype.nearestPoint = function(position, threshold) {
    var idx = this.nearestPointIndex(position, threshold)
    return idx === -1 ? null : this.points[idx]
}

DrawPaths.prototype.nearestControl = function(position, threshold) {
    threshold = typeof threshold === 'number' ? threshold : Number.MAX_VALUE

    var nearest = null
    var associatedPoint = null
    var minDist = Number.MAX_VALUE
    var controlIndex = -1
    for (var i=0; i<this.points.length; i++) {
        var p = this.points[i]
        for (var j=0; j<p.controls.length; j++) {
            var distance = dist(p.controls[j], position)
            
            if (distance < minDist && distance < threshold) {
                nearest = p.controls[j]
                associatedPoint = p
                controlIndex = j
                minDist = distance
            }
        }
            
    }
    return nearest ? { 
            isControl: true,
            position: nearest, 
            index: controlIndex, 
            parent: associatedPoint 
        } : null
}

DrawPaths.prototype.lastPoint = function() {
    return this.points[this.points.length-1]
}
DrawPaths.prototype.firstPoint = function() {
    return this.points[0]
}

DrawPaths.prototype.drawPath = function(ctx, path) {
    var points = path.points,
        closed = path.closed

    for (var i=0; i<points.length; i++) {
        var p = points[i]
        var pos = p.position
        
        if (i===0) 
            ctx.moveTo(pos[0], pos[1])

        var last = i>0 ? points[i-1] : null
        if (i===0 && points.length>1 && closed) { //if we are closed and at start
            var last = points[points.length-1]
            ctx.moveTo(last.position[0], last.position[1])
        }

        //if we need a bezier order curve
        if (last && last.curve && p.curve) {
            var c1 = last.controls[1],
                c2 = p.controls[0]
            ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], pos[0], pos[1])
        }
        else if (last && last.curve) {
            var c1 = last.controls[1]
            ctx.quadraticCurveTo(c1[0], c1[1], pos[0], pos[1])
        }
        else if (p.curve && i>0) {
            var c1 = p.controls[0]
            ctx.quadraticCurveTo(c1[0], c1[1], pos[0], pos[1])
        }
        else
            ctx.lineTo(pos[0], pos[1])
    }
}

DrawPaths.prototype.drawEditingPath = function(ctx, path) {
    var points = path.points,
        closed = path.closed

    var radius = this.pointRadius,
        controlStyle = 'blue',
        controlAlpha = this.controlAlpha
        pointStyle = '#2d2d2d'

    if (closed) {
        ctx.beginPath()
        this.drawPath(ctx, path)
        ctx.globalAlpha = 0.2
        ctx.fillStyle = pointStyle
        ctx.fill()
    }

    //draw control points
    ctx.beginPath()
    for (var i=0; i<points.length; i++) {
        if (!points[i].curve)
            continue

        var pos = points[i].position
        var controls = points[i].controls
        for (var j=0; j<controls.length; j++) {
            var p = controls[j]
            ctx.moveTo(pos[0], pos[1])
            ctx.lineTo(p[0], p[1])
        }
    }
    ctx.globalAlpha = controlAlpha
    ctx.lineWidth = 1
    ctx.strokeStyle = controlStyle
    ctx.stroke()

    //draw control points
    ctx.beginPath()
    for (var i=0; i<points.length; i++) {
        if (!points[i].curve)
            continue

        var controls = points[i].controls
        for (var j=0; j<controls.length; j++) {
            var p = controls[j]
            ctx.moveTo(p[0], p[1])
            ctx.arc(p[0], p[1], radius, 0, Math.PI*2, false)    
        }
    }
    ctx.globalAlpha = controlAlpha
    ctx.fillStyle = controlStyle
    ctx.fill()


    //draw lines
    ctx.beginPath()
    this.drawPath(ctx, path)
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = pointStyle
    ctx.stroke()

    //draw points
    ctx.beginPath()
    for (var i=0; i<points.length; i++) {
        var p = points[i].position
        ctx.moveTo(p[0], p[1])
        ctx.arc(p[0], p[1], radius, 0, Math.PI*2, false)
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = pointStyle
    ctx.fill()

}

DrawPaths.prototype.draw = function(ctx) {
    this.drawEditingPath(ctx, { points: this.points, closed: this.closed })

    if (this.activePoint) {
        var pos = this.activePoint.position
        var isControl = this.activePoint.isControl

        var radius = isControl ? this.controlRadius : this.pointRadius
        ctx.globalAlpha = isControl ? this.controlAlpha : 0.5
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = isControl ? this.controlStyle : this.pointStyle
        ctx.arc(pos[0], pos[1], radius+4, 0, Math.PI*2, false)
        ctx.stroke()
    }
}


module.exports = DrawPaths