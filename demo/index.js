var events = require('dom-events')
var offset = require('mouse-event-offset')
require('canvas-testbed')(render, start)

var paths = require('../')()

var dist = require('vectors/dist')(2)

function render(ctx, width, height) {
    ctx.clearRect(0,0,width,height)

    paths.draw(ctx)
}

function start(ctx, width, height) {
    ctx.canvas.onselectstart = function() { return false }

    var dragging = false,
        dragButton = 0,
        startedCurve = false,
        curveStartThreshold = 15



    events.on(ctx.canvas, 'mousedown', function(ev) {
        ev.preventDefault()

        var off = offset(ev)
        
        if (paths.points.length >= 0) {
            dragging = true
            dragButton = ev.button
            startedCurve = false
        }
         
        if (ev.ctrlKey || ev.metaKey) {
            paths.emit('close-path')
        }
        else if (paths.activePoint) {
            paths.emit('move-active', {
                position: [off.x, off.y]
            })
        } 
        else {
            paths.emit('place', { position: [ off.x, off.y ] })
        }
    })

    events.on(ctx.canvas, 'mousemove', function(ev) {
        ev.preventDefault()

        var off = offset(ev)
        var pos = [ off.x, off.y ]

        if (ev.button === dragButton && dragging) {
            if (paths.activePoint) {
                paths.emit('move-active', {
                    position: pos
                })
            }
            else {
                var lastPoint = paths.lastPoint()
                
                if (!startedCurve) {
                    if (dist(lastPoint.position, pos) < curveStartThreshold) 
                        return
                    startedCurve = true
                }

                paths.emit('adjust-curve', {
                    point: lastPoint,
                    position: pos
                })
            }
        } else if (!dragging) {
            paths.emit('mousemove', { position: [ off.x, off.y ] })
        }
    })

    events.on(ctx.canvas, 'mouseup', function(ev) {
        if (ev.button === dragButton) {
            dragging = false


        }
        var off = offset(ev)
        var pos = [ off.x, off.y ]
        paths.emit('mouseup', {
            position: pos
        })    
    })

    events.on(ctx.canvas, 'mousemove', function(ev) {
        if (!dragging) {
            
        }
    })
}