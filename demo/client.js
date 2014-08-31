var events = require('dom-events')
var offset = require('mouse-event-offset')

var dist = require('vectors/dist')(2)

module.exports = function setupEvents(paths, opt) {
    opt = opt||{}

    opt.element = opt.element || window

    if (typeof opt.curveStartDistance !== 'number')
        opt.curveStartDistance = 15

    var dragging = false,
        dragButton = 0,
        startedCurve = false

    events.on(element, 'mousedown', function(ev) {
        ev.preventDefault()

        var off = offset(ev)
        var dragStart = false
        
        var shouldClose = ev.ctrlKey || ev.metaKey
        if (shouldClose && !paths.closed) {
            paths.emit('close-path')
        }
        else if (paths.activePoint) {
            dragStart = true && paths.points.length >= 0
            if (ev.shiftKey && !paths.activePoint.isControl) {
                paths.activePoint.curve = false
            } else {
                paths.emit('move-active', {
                    position: [off.x, off.y]
                })
            }   
        } 
        else if (!paths.closed) {
            dragStart = true && paths.points.length >= 0
            paths.emit('place', { position: [ off.x, off.y ] })
        }

        if (dragStart) {
            dragging = true
            dragButton = ev.button
            startedCurve = false
        }
    })

    events.on(element, 'mousemove', function(ev) {
        ev.preventDefault()

        var off = offset(ev)
        var pos = [ off.x, off.y ]

        if (ev.button === dragButton && dragging) {
            var makingCurve = paths.activePoint 
                        && !paths.activePoint.isControl
                        && ev.shiftKey

            if (!makingCurve && paths.activePoint) {
                paths.emit('move-active', {
                    position: pos
                })
            }
            else {
                var lastPoint = paths.lastPoint()

                if (!startedCurve) {
                    if (dist(lastPoint.position, pos) < opt.curveStartDistance) 
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

    events.on(element, 'mouseup', function(ev) {
        if (ev.button === dragButton) {
            dragging = false
        }
        var off = offset(ev)
        var pos = [ off.x, off.y ]
        paths.emit('mouseup', {
            position: pos
        })    
    })
}