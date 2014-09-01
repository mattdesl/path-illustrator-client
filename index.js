var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var Point = require('./point')
var Renderer = require('./renderer')

var pointAlongPath = require('./point-along-path')

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
    this.hoverDistance = 10
    this.renderer = new Renderer(opt)
    this.showAllControls = false
    this.drawing = true
    this.pointOnPathIndex = -1
    this.pointOnPath = [0, 0]
    this.allowAdd = true
    this.allowRemove = true

    this.on('add-point', function(e) {
        var point = new Point(e.position)
        if (typeof e.index === 'number') {
            this.points.splice(e.index, 0, point)
            this._updateActive(e)
        } else
            this.points.push(point)
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


    // this.on('mouseup', this._updateActive.bind(this))
    this.on('mousemove', this._updateActive.bind(this))

    this.on('close-path', function() {
        if (this.points.length<=1)
            return
        this.closed = true
    }.bind(this))

    this.on('move-shape', function(e) {
        var point = this.activePoint
        if (!point || point.isControl)
            return
        var old = point.position
        var translate = sub( copy(e.position), old )
        this.points.forEach(function(p) {
            translatePoint(p, translate)
        })
    })

    this.on('move-active', function(e) {
        var point = this.activePoint
        if (!point)
            return
        if (point.isControl && point.parent) {
            point.parent.controls[ point.index ] = e.position
            point.position = e.position
        } else {
            var old = point.position

            var translate = sub( copy(e.position), old )
            translatePoint(point, translate)
        }
    })

    this.on('remove-point', function(e) {
        if (!e.point)
            return
        var idx = this.points.indexOf(e.point)
        if (idx===-1)
            return

        this.points.splice(idx, 1)
        if (this.activePoint === e.point)
            this.activePoint = null
    })
}


function translatePoint(point, amount) {
    add( point.position, amount )

    for (var j=0; j<point.controls.length; j++) {
        var c = point.controls[j]
        add( c, amount )
    }
}

inherits(DrawPaths, EventEmitter)

DrawPaths.prototype._updateActive = function(e) {
    //point takes precedence
    var closest = this.nearestPoint(e.position, this.hoverDistance)
    this.activePoint = closest

    if (!closest) {
        this.activePoint = this.nearestControl(e.position, this.hoverDistance)
        if (this.activePoint && !this.controlsVisible(this.activePoint.pointIndex))
            this.activePoint = null
    }

    this.pointOnPath = [0, 0]
    //determine the mouse over point
    this.pointOnPathIndex = pointAlongPath(this.points, e.position, this.hoverDistance, this.pointOnPath)

    if (this.pointOnPathIndex === -1) 
        this.pointOnPath = null

    if (this.activePoint && this.pointOnPath
            && (this.pointOnPath[0] === this.activePoint.position[0] 
            && this.pointOnPath[1] === this.activePoint.position[1])) {
        this.pointOnPath = null
        this.pointOnPathIndex = -1
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
    var pointIndex = -1
    for (var i=0; i<this.points.length; i++) {
        var p = this.points[i]
        for (var j=0; j<p.controls.length; j++) {
            var distance = dist(p.controls[j], position)
            
            if (distance < minDist && distance < threshold) {
                nearest = p.controls[j]
                associatedPoint = p
                pointIndex = i
                controlIndex = j
                minDist = distance
            }
        }
            
    }
    return nearest ? { 
            isControl: true,
            position: nearest, 
            index: controlIndex, 
            pointIndex: pointIndex,
            parent: associatedPoint 
        } : null
}

DrawPaths.prototype.lastPoint = function() {
    return this.points[this.points.length-1]
}
DrawPaths.prototype.firstPoint = function() {
    return this.points[0]
}

DrawPaths.prototype.controlsVisible = function(pointIndex) {
    if (!this.drawing)
        return false

    var point = this.points[pointIndex]
    if (!point || !point.curve)
        return false

    //if it's being drawn
    if (pointIndex === this.points.length-1)
        return true

    //if we are highlighting it..
    var active = this.activePoint
    if (point === active)
        return true

    //or if all controls are visible
    return this.showAllControls
}

DrawPaths.prototype.draw = function(ctx) {
    var path = { points: this.points, closed: this.closed }
    this.renderer.draw(this, ctx, path, this.activePoint)
}

DrawPaths.prototype.clear = function() {
    this.points.length = 0
    this.closed = false
    this.activePoint = null
}

module.exports = DrawPaths