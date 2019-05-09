# react physics dragger

> A simple, no-frills horiztonal dragger/slider with physics

[View on Codesandbox](https://codesandbox.io/s/54452vm5kp)

[![NPM](https://img.shields.io/npm/v/react-physics-dragger.svg?style=flat-square)](https://www.npmjs.com/package/react-physics-dragger)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-physics-dragger.svg?style=flat-square)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

A React component which basically adds a wrapper element with horizontal dragging capabilities. It uses a little bit of physics to apply friction and boundary bouncing (similar to Apple's interfaces, and the [Flickity](https://flickity.metafizzy.co/) carousel).

* Works with both touch and mouse
* 0 dependencies
* Super small (Gzip 2.5kb)


## Example usage

```
yarn add react-physics-dragger
# or
npm i react-physics-dragger
```

It uses [ResizeObserver](https://caniuse.com/#search=resizeobserver) so you might need to add a polyfill. If so, instructions below.

```
import Dragger from 'react-physics-dragger'
import ResizeObserver from 'resize-observer-polyfill' // If you need a ResizeObserver polyfill, this one works pretty great.

const App = () => {
  return (
    <Dragger
      disabled={false} // Optional. Default is false.
      ResizeObserver={ResizeObserver} // If you need the polyfill pass it in here. Simples.
      friction={0.9} // Optional
      onFrame={frame => {...}} // Optional. This function is fired on every movement, resize, and mount.
      className="dragger" // Pass in whatever classNames or styles you'd like.
    >
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </Dragger>
  )
}
```


## Todo: 
- [ ] Tests!
- [ ] Maybe convert it to hooks?
- [ ] Could it work with sideways mouse scrolling?

<br>

### Inspired by [Dave DeSandro's](https://twitter.com/desandro) work on Practical UI Physics <br>
https://www.youtube.com/watch?v=90oMnMFozEE <br>
https://codepen.io/desandro/pen/QbPKEq

This library was packaged with https://github.com/transitive-bullshit/create-react-library

## License

MIT © [nickmcmillan](https://github.com/nickmcmillan)
