var events = require('dom-events')
var offset = require('mouse-event-offset')
require('canvas-testbed')(render, start)

var paths = require('../')()
var client = require('../client')

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

    client(paths, {
        element: ctx.canvas
    })

    document.body.appendChild( domify(content) )
}