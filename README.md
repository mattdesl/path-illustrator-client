[![browser support](https://ci.testling.com/mattdesl/path-illustrator-client.png)](https://ci.testling.com/mattdesl/path-illustrator-client)

# path-illustrator-client

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

This makes up the internals for [path-illustrator](https://nodei.co/npm/path-illustrator-client/). You should not rely on this module directly since it is far from stable and has no guaranteed public API. Instead, use `path-illustrator` and its documented API.

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
  - ~~add / remove points along line~~ **done**
  - add points along bezier curve
  - select, move multiple points
  - close the path when clicking last point
  - arrow keys nudge by 1px and 10px
  - ~~hide control points to avoid clutter~~ **done**
  - smarter selection of control points like in PS
  - lock control points until they are moved separately
- undo / redo
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
- dev tools
  - code fill: enter a function for procedurally filling a scene with points

## etches

The end goal of the project is to create a reusable system for path animations. 

An "etch" contains the saved state of the path client, complete with animations and stlyes. Etches can be installed locally or published to npm. For example, users can enter "etch-hamburger-button" or "mattdesl/etch-radial-preloader" (for GitHub repos) to get certain paths and animations. 

## Usage

[![NPM](https://nodei.co/npm/path-illustrator-client.png)](https://nodei.co/npm/path-illustrator-client/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/path-illustrator-client/blob/master/LICENSE.md) for details.
