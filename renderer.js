var dist = require('vectors/dist')(2)
var copy = require('vectors/copy')(2)
var drawPath = require('./draw-path')

function Renderer(opt) {
    opt = opt||{}
    this.showPointOnPath = true

    this.pointRadius = typeof opt.pointRadius === 'number' ? opt.pointRadius : 3
    this.controlRadius = typeof opt.controlRadius === 'number' ? opt.controlRadius : 2
    this.controlAlpha = typeof opt.controlAlpha === 'number' ? opt.controlAlpha : 0.2
    this.controlStyle = opt.controlStyle || 'blue'
    this.pointStyle = opt.pointStyle || '#2d2d2d'
    this.drawingPointStyle = opt.drawingPointStyle || 'white'
    this.highlightAlpha = typeof opt.highlightAlpha === 'number' ? opt.highlightAlpha : 0.5

    this.stroke = opt.stroke !== false
    this.fill = opt.fill !== false
    this.showEditingPoints = opt.showEditingPoints !== false

    this.controlLineWidth = typeof opt.controlLineWidth === 'number' ? opt.controlLineWidth : 1
    this.lineWidth = typeof opt.lineWidth === 'number' ? opt.lineWidth : 2
    this.strokeStyle = opt.strokeStyle || this.pointStyle
    this.strokeAlpha = typeof opt.strokeAlpha === 'number' ? opt.strokeAlpha : 0.5
    this.fillStyle = opt.fillStyle || this.pointStyle
    this.fillAlpha = typeof opt.fillAlpha === 'number' ? opt.fillAlpha : 0.5
}


Renderer.prototype.drawHighlight = function(parent, ctx, path, active) {
    if (active) {
        var pos = active.position
        var isControl = active.isControl

        if (isControl && !parent.controlsVisible(active.pointIndex))
            return
        var isClosing = !isControl 
                && path.points.length > 2
                && active === path.points[0]
                && !parent.closed

        var radius = isControl ? this.controlRadius : this.pointRadius
        ctx.globalAlpha = isControl ? this.controlAlpha : this.highlightAlpha
        ctx.beginPath()
        ctx.lineWidth = this.lineWidth
        ctx.arc(pos[0], pos[1], radius+4, 0, Math.PI*2, false)

        if (isClosing) {
            ctx.strokeStyle = this.pointStyle
            ctx.stroke()
        } else {
            ctx.fillStyle = isControl ? this.controlStyle : this.pointStyle
            ctx.fill()
        }
    }
    if (parent.pointOnPath && this.showPointOnPath) {
        var pos = parent.pointOnPath
        ctx.beginPath()
        ctx.globalAlpha = this.highlightAlpha
        ctx.strokeStyle = this.pointStyle
        ctx.arc(pos[0], pos[1], this.pointRadius, 0, Math.PI*2, false)
        ctx.stroke()
    }
}

Renderer.prototype.drawControlPoints = function(parent, ctx, path, active) {
    var points = path.points,
        closed = path.closed

    var radius = this.pointRadius,
        controlStyle = this.controlStyle,
        controlAlpha = this.controlAlpha,
        pointStyle = this.pointStyle

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
    ctx.lineWidth = this.controlLineWidth
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
        controlStyle = this.controlStyle,
        controlAlpha = this.controlAlpha
        pointStyle = this.pointStyle


    this.drawControlPoints(parent, ctx, path, active)

    //draw lines
    ctx.beginPath()
    drawPath(ctx, path)
    ctx.lineWidth = this.lineWidth
    ctx.globalAlpha = this.strokeAlpha
    ctx.strokeStyle = this.strokeStyle
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
            ctx.lineWidth = 1
            ctx.stroke()
        } else {
            ctx.fillStyle = pointStyle
            ctx.fill()
        }

    }
}

Renderer.prototype.draw = function(parent, ctx, path, active) {
    ctx.globalAlpha = 1
    if (path.closed && (this.fill||this.stroke)) {
        ctx.beginPath()
        drawPath(ctx, path)
        ctx.globalAlpha = this.fillAlpha
        ctx.fillStyle = this.fillStyle

        if (this.fill) {
            ctx.fillStyle = this.fillStyle
            ctx.globalAlpha = this.fillAlpha
            ctx.fill()
        }
        if (this.stroke) {
            ctx.globalAlpha = this.strokeAlpha
            ctx.strokeStyle = this.strokeStyle
            ctx.stroke()
        }
    }

    if (this.showEditingPoints) {
        this.drawEditingPath(parent, ctx, path, active)
        this.drawHighlight(parent, ctx, path, active)
    }
}

module.exports = Renderer