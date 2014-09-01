[![browser support](https://ci.testling.com/mattdesl/etch-draw-paths.png)](https://ci.testling.com/mattdesl/etch-draw-paths)

# etch-draw-paths

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# work in progress

Proof of concept. Eventually this may or may not turn into a tool for web animations and rich UI. The goals:

- intuitive photoshop-like path and curve editing
- minimal set of SVG features (fills, strokes, gradients)
- masks
- timeline with keyframes for animating points
- export to JSON 

The ultimate goal is to bring [motion graphics](https://www.youtube.com/watch?v=-L8tQyLEEZs) to real-time applications (web interfaces, game UIs, etc).

# laundry list

Some things here will probably never make it into the tool. This is some stuff that designers will want or expect:

- path editing
  - add / remove points along line
  - select, move multiple points
  - close the path when clicking last point
  - arrow keys nudge by 1px and 10px
  - hide control points to avoid clutter
  - smarter selection of control points like in PS
  - lock control points until they are moved separately
- transforms
  - scale / skew / rotate / flip
- viewport
  - zoom in/out
  - panning
- styling
  - grouped styling (like css classes)
  - fill / stroke / gradient / pattern
- timeline
  - keyframes for jump cuts
  - keyframes for tweening
  - ease curve editing
- snapping
  - snap along straight edges and 45 degree angles
- code fill
  - e.g. to quickly fill a canvas with points randomly you could add a function

## Usage

[![NPM](https://nodei.co/npm/etch-draw-paths.png)](https://nodei.co/npm/etch-draw-paths/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/etch-draw-paths/blob/master/LICENSE.md) for details.
