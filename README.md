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


# end goal

### etches

The end goal of the project is to create a reusable system for path animations. 

An "etch" contains the saved state of the path client, complete with animations and stlyes. Etches can be installed locally or published to npm. For example, users can enter "etch-hamburger-button" or "mattdesl/etch-radial-preloader" (for GitHub repos) to get certain paths and animations. 

### etch styling

Reusable components are not very useful unless we can provide styles for application-specific colors/animations/etc. "etch designers" (those developing the etches) will expose certain "attributes" that others can tweak. Kind of like public members in Unity. 

### etches are program and renderer agnostic

Really important is that the etch is just a list of keyframes with path/style/color/attribute. It has no ties to HTML5 canvas or the path client that made it. 

## Usage

[![NPM](https://nodei.co/npm/path-illustrator-client.png)](https://nodei.co/npm/path-illustrator-client/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/path-illustrator-client/blob/master/LICENSE.md) for details.
