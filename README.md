# react physics dragger

> Simple, no-frills horizontal dragger/slider

[View on Codesandbox](https://codesandbox.io/s/54452vm5kp)

[![NPM](https://img.shields.io/npm/v/react-physics-dragger.svg?style=flat-square)](https://www.npmjs.com/package/react-physics-dragger)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-physics-dragger.svg?style=flat-square)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

Basically creates a wrapper element with horizontal dragging capabilities. It uses basic physics which apply friction and also bouncing past boundaries (similar to Apple).

Works with both touch and mouse.


## Example usage

```
yarn add react-physics-dragger
# or
npm i react-physics-dragger
```

This uses [ResizeObserver](https://caniuse.com/#search=resizeobserver). You might need to add a polyfill. If so, instructions below.

```
import Dragger from 'react-physics-dragger'
import ResizeObserver from 'resize-observer-polyfill' // If you need a ResizeObserver polyfill, this one works great.

class App extends Component {
  render() {
    return (
      <Dragger
          disabled={false} // Optional. Default is false
          ResizeObserver={ResizeObserver} // If you need the polyfill, pass it in here. Simples. 
          friction={0.9} // Optional. Default is 0.9
          padding={0} // Optional. This is the boundary padding on the left and right. Default is 0
          onMove={this.handleOnMove} // Optional. This is a callback function, fired on every movement. Also fired on initial mount.
          className="dragger" // Pass in whatever classnames or styles you'd like. This will accept and spread all props.
        >
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </Dragger>
    )
  }
}

export default App
```


## Todo: 
- [ ] Maybe convert it to hooks, less imperative, more functional
- [ ] Could it work with sideways scrolling?
- [ ] Scroll to x position API

This library was packaged with https://github.com/transitive-bullshit/create-react-library

## License

MIT © [nickmcmillan](https://github.com/nickmcmillan)
