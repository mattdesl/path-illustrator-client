//very limited SVG -> path tool


var parse = require('parse-svg-path')
var sub = require('vectors/sub')(2)
var add = require('vectors/add')(2)
var copy = require('vectors/copy')(2)


function curveTo(out, prev, c1, c2, pos) {
    prev.controls[1] = c1
    prev.curve = true

    var point = {
        controls: [c2, pos],
        position: pos,
        curve: true    
    }
    out.push(point)
    return point
}

module.exports = function(contents) {
    var path = parse(contents)

    if (path.length > 0) {
        var out =  {
            closed: false,
            points: []
        }

        var firstCommand = path[0][0]
        if (firstCommand!=='M'&&firstCommand!=='m')
            throw new Error('need a moveTo as first command')

        var lastPos = [0, 0],
            endControl = null

        path.forEach(function(p, i) {
            var cmd = p[0]
            if (i>0 && (cmd==='m'||cmd==='M')) {
                throw new Error('only one shape supported for now')
            }

            var point
            if (i===path.length-2) {
                out.points[0].controls[0] = [0,0]
                return
            }

            if (cmd==='M'||cmd==='m') {
                point = { 
                    curve: false, 
                    controls: [ [0,0], [0,0] ],
                    position: [ p[1], p[2] ]
                }

                add(point.position, [100, 100])
                out.points.push(point)
            }
            else if (cmd==='c' || cmd==='C') {
                var c1 = [ p[1], p[2] ],
                    c2 = [ p[3], p[4] ],
                    pos = [ p[5], p[6] ]

                var relative = cmd==='c'
                if (relative) {
                    c1 = sub( copy(lastPos), c1 )
                    c2 = sub( copy(lastPos), c2 )
                    pos = sub( copy(lastPos), pos )
                }

                if (!endControl)
                    endControl = c1

                var prev = out.points[i-1]
                point = curveTo(out.points, prev, c1, c2, pos)
            } 
            else if (cmd==='z'||cmd==='Z')
                out.closed = true

            if (point)
                lastPos = copy(point.position)
        })
        return out
    }
}

if (require.main === module) {
    var file = process.argv[2]
    var contents = require('fs').readFileSync(file, 'utf8').replace(/(\n|\t)/g, ' ')
    var out = module.exports(contents)
    console.log( JSON.stringify( out ) )
}