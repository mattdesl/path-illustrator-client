var offset = require('mouse-event-offset')
var dist = require('vectors/dist')(2)

module.exports = function(opt) {
    opt = opt||{}

    if (typeof opt.curveStartDistance !== 'number')
        opt.curveStartDistance = 15

    var dragging = false,
        dragButton = 0,
        startedCurve = false,
        adjustEventType = null

    return {
        name: 'multitool',
        description: 'multi purpose path drawing',

        setup: function(paths) {
            this.moveDirect = true
        },

        mousedown: function(ev, paths) {
            ev.preventDefault()


            var off = offset(ev)
            var pos = [off.x, off.y]
            var dragStart = false

            adjustEventType = null
            
            var moveKey = ev.ctrlKey||ev.metaKey
            var shouldClose = moveKey && ev.shiftKey && paths.points.length>2
            var addLinePoint = paths.pointOnPath && paths.allowAdd
                            && !paths.activePoint

            if (!moveKey && paths.drawing 
                && paths.activePoint && !paths.activePoint.isControl
                && !paths.closed
                && paths.points.length > 2
                && paths.activePoint === paths.points[0]) {
                shouldClose = true
            }

            if (!paths.drawing && (moveKey||!this.moveDirect) ) {
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
                paths.emit('close-path', {
                    adjusting: true
                })
                dragStart = true
                adjustEventType = 'close-path'
            }
            else if (paths.activePoint) {
                dragStart = paths.points.length >= 0
                adjustEventType = dragStart ? 'adjust-curve' : 'move-active'
                
                if (moveKey) {
                    if (this.moveDirect)
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
                adjustEventType = dragStart ? 'add-point' : 'add-point'

                paths.emit('add-point', { 
                    adjusting: dragStart,
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

                if (!paths.drawing && (moveKey||!this.moveDirect)) {
                    adjustEventType = 'move-shape'
                    paths.emit('move-shape', {
                        position: pos
                    })
                }
                else if (!makingCurve && paths.activePoint) {
                    if (this.moveDirect) {
                        adjustEventType = 'move-active'
                        paths.emit('move-active', {
                            position: pos
                        })
                    }
                }
                else {
                    if (!startedCurve) {
                        if (dist(lastPoint.position, pos) < opt.curveStartDistance) 
                            return
                        startedCurve = true
                        // adjustEventType = 'adjust-curve'
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
                if (dragging) {
                    paths.emit('finish-change', {
                        type: adjustEventType
                    })
                }
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