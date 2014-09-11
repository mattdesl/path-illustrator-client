module.exports = function drawPath(ctx, path) {
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
