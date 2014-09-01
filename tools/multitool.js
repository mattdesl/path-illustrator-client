var offset = require('mouse-event-offset')
var dist = require('vectors/dist')(2)

module.exports = function(opt) {
    opt = opt||{}

    if (typeof opt.curveStartDistance !== 'number')
        opt.curveStartDistance = 15

    var dragging = false,
        dragButton = 0,
        startedCurve = false

    return {
        name: 'multitool',
        description: 'multi purpose path drawing',

        setup: function(paths) {
            // paths.showAllControls = true
            // paths.drawing = true
        },

        mousedown: function(ev, paths) {
            ev.preventDefault()

            var off = offset(ev)
            var pos = [off.x, off.y]
            var dragStart = false
            
            var moveKey = ev.ctrlKey||ev.metaKey
            var shouldClose = moveKey && ev.shiftKey
            var addLinePoint = paths.pointOnPath && paths.allowAdd
                            && !paths.activePoint

            if (!moveKey && paths.drawing 
                && paths.activePoint && !paths.activePoint.isControl
                && !paths.closed
                && paths.activePoint === paths.points[0]) {
                shouldClose = true
            }

            if (!paths.drawing && moveKey) {
                dragStart = true
                paths.emit('move-shape', {
                    position: pos
                })
            }
            else if (paths.drawing 
                    && paths.activePoint 
                    && !paths.activePoint.isControl
                    && paths.allowRemove
                    && ev.altKey) {
                paths.emit('remove-point', {
                    point: paths.activePoint
                })
            }
            else if (shouldClose && !paths.closed && paths.drawing) {
                paths.emit('close-path')
            }
            else if (paths.activePoint) {
                dragStart = paths.points.length >= 0

                if (moveKey) {
                    paths.emit('move-active', {
                        position: pos
                    })
                }
                else if (!paths.activePoint.isControl && paths.drawing) {
                    paths.activePoint.curve = false
                } 
            } 
            else if (!moveKey && ((!paths.closed && paths.drawing) || addLinePoint)) {
                dragStart = !addLinePoint && paths.points.length >= 0
                paths.emit('add-point', { 
                    position: addLinePoint ? paths.pointOnPath : pos,
                    index: addLinePoint ? paths.pointOnPathIndex : undefined
                })
            }

            if (dragStart) {
                dragging = true
                dragButton = ev.button
                startedCurve = false
            }
        },

        mousemove: function(ev, paths) {
            ev.preventDefault()

            var off = offset(ev)
            var pos = [ off.x, off.y ]

            if (ev.button === dragButton && dragging) {
                var moveKey = ev.ctrlKey||ev.metaKey
                var lastPoint = paths.lastPoint()

                var makingCurve = paths.activePoint 
                            && !paths.activePoint.isControl
                            && !moveKey
                            && paths.drawing

                if (makingCurve) {
                    startedCurve = true
                    lastPoint = paths.activePoint
                }

                if (!paths.drawing && moveKey) {
                    paths.emit('move-shape', {
                        position: pos
                    })
                }
                else if (!makingCurve && paths.activePoint) {
                    paths.emit('move-active', {
                        position: pos
                    })
                }
                else {
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
        },

        mouseup: function(ev, paths) {
            if (ev.button === dragButton) {
                dragging = false
            }
            var off = offset(ev)
            var pos = [ off.x, off.y ]
            paths.emit('mouseup', {
                position: pos
            })    
        }
    }
}