var dist = require('vectors/dist')(2)
var copy = require('vectors/copy')(2)

function Renderer(options) {
    this.pointRadius = 3
    this.controlRadius = 2
    this.controlAlpha = 0.2
    this.controlStyle = 'blue'
    this.pointStyle = '#2d2d2d'
    this.drawingPointStyle = 'white'
    this.showControls = true
}

Renderer.prototype.drawPath = function(parent, ctx, path) {
    var points = path.points,
        closed = path.closed

    for (var i=0; i<points.length; i++) {
        var p = points[i]
        var pos = p.position
        
        if (i===0) 
            ctx.moveTo(pos[0], pos[1])

        var last = i>0 ? points[i-1] : null
        var lastCurve = last && last.curve
        var curve = p.curve

        if (i===0 && points.length>1 && closed) { //if we are closed and at start
            last = points[points.length-1]
            lastCurve = last.curve
            ctx.moveTo(last.position[0], last.position[1]) 
            if (!lastCurve && p.curve) {
                var c1 = p.controls[0]
                ctx.quadraticCurveTo(c1[0], c1[1], pos[0], pos[1])
            }
        }


        //if we need a bezier order curve
        if (last && lastCurve && curve) {
            var c1 = last.controls[1],
                c2 = p.controls[0]
            ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], pos[0], pos[1])
        }
        else if (last && lastCurve) {
            var c1 = last.controls[1]
            ctx.quadraticCurveTo(c1[0], c1[1], pos[0], pos[1])
        }
        else if (curve && i>0) {
            var c1 = p.controls[0]
            ctx.quadraticCurveTo(c1[0], c1[1], pos[0], pos[1])
        }
        else
            ctx.lineTo(pos[0], pos[1])
    }
}

Renderer.prototype.drawHighlight = function(parent, ctx, active) {
    if (active) {
        var pos = active.position
        var isControl = active.isControl

        if (isControl && !parent.controlsVisible(active.pointIndex))
            return

        var radius = isControl ? this.controlRadius : this.pointRadius
        ctx.globalAlpha = isControl ? this.controlAlpha : 0.5
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.fillStyle = isControl ? this.controlStyle : this.pointStyle
        ctx.arc(pos[0], pos[1], radius+4, 0, Math.PI*2, false)
        ctx.fill()
    }
    if (parent.pointOnPath) {
        var pos = parent.pointOnPath
        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = this.pointStyle
        ctx.arc(pos[0], pos[1], this.pointRadius, 0, Math.PI*2, false)
        ctx.stroke()
    }
}

Renderer.prototype.drawControlPoints = function(parent, ctx, path, active) {
    var points = path.points,
        closed = path.closed

    var radius = this.pointRadius,
        controlStyle = 'blue',
        controlAlpha = this.controlAlpha
        pointStyle = '#2d2d2d'

    //draw control points
    ctx.beginPath()
    for (var i=0; i<points.length; i++) {
        if (!points[i].curve)
            continue
        if (!parent.controlsVisible(i))
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
        if (!parent.controlsVisible(i))
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
}

Renderer.prototype.drawEditingPath = function(parent, ctx, path, active) {
    var points = path.points,
        closed = path.closed

    var radius = this.pointRadius,
        controlStyle = 'blue',
        controlAlpha = this.controlAlpha
        pointStyle = '#2d2d2d'

    if (closed) {
        ctx.beginPath()
        this.drawPath(parent, ctx, path)
        ctx.globalAlpha = 0.2
        ctx.fillStyle = pointStyle
        ctx.fill()
    }

    this.drawControlPoints(parent, ctx, path, active)

    //draw lines
    ctx.beginPath()
    this.drawPath(parent, ctx, path)
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = pointStyle
    ctx.stroke()

    //draw points
    ctx.beginPath()
    for (var i=0; i<points.length; i++) {
        var p = points[i].position
        if (!closed && i===points.length-1)
            continue
        ctx.moveTo(p[0], p[1])
        ctx.arc(p[0], p[1], radius, 0, Math.PI*2, false)        
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = pointStyle
    ctx.fill()

    if (points.length > 0 && !closed) {
        ctx.beginPath()
        var p = points[points.length-1].position
        if (parent.drawing)
            ctx.rect(p[0]-radius, p[1]-radius, radius*2, radius*2)
        else
            ctx.arc(p[0], p[1], radius, 0, Math.PI*2, false)        
        ctx.globalAlpha = 1
        if (parent.drawing) {
            ctx.strokeStyle = pointStyle
            ctx.fillStyle = this.drawingPointStyle
            ctx.fill()
            ctx.stroke()
        } else {
            ctx.fillStyle = pointStyle
            ctx.fill()
        }

    }
}

Renderer.prototype.draw = function(parent, ctx, path, active) {
    ctx.lineJoin = 'round'
    ctx.lineCap = 'square'
    this.drawEditingPath(parent, ctx, path, active)
    this.drawHighlight(parent, ctx, active)
}

module.exports = Renderer