var events = require('dom-events')
var offset = require('mouse-event-offset')
require('canvas-testbed')(render, start)


var paths = require('../')()
var createClient = require('../client')
var tools = require('../tools')

var dist = require('vectors/dist')(2)
var domify = require('domify')

var fs = require('fs')
var content = fs.readFileSync(__dirname+'/content.html', 'utf8')
var css = fs.readFileSync(__dirname+'/content.css', 'utf8')
require('insert-css')(css)

function render(ctx, width, height) {
    ctx.clearRect(0,0,width,height)

    paths.draw(ctx)
}

function start(ctx, width, height) {
    ctx.canvas.onselectstart = function() { return false }
    ctx.canvas.oncontextmenu = function (e) {
        e.preventDefault()
    }

    var client = createClient(paths, {
        element: ctx.canvas
    })

    tools = tools.map(function(t) {
        return t()
    })
    client.tool = tools[0]

    document.body.appendChild( domify(content) )
    events.on(window, 'keydown', function(ev) {
        var kc = ev.which||ev.keyCode
        var chr = String.fromCharCode(kc).toLowerCase()
        var num = parseInt(chr, 10)
        
        if (num > 0 && num <= tools.length) {
            curTool = num-1
            console.log("Current tool", tools[curTool].name)
        }
        if (chr === 'c') {
            paths.showAllControls = !paths.showAllControls
        } else if (kc ===32) {
            ev.preventDefault()
            paths.clear()
        } else if (chr === 'm') {
            paths.drawing = !paths.drawing
        }
    })


}