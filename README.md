# React Physics Dragger
> A simple, no-frills horiztonal dragger/slider with physics


![example gif](https://raw.githubusercontent.com/nickmcmillan/react-physics-dragger/master/example.gif)

[![NPM](https://img.shields.io/npm/v/react-physics-dragger.svg?style=flat-square)](https://www.npmjs.com/package/react-physics-dragger)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-physics-dragger.svg?style=flat-square)

[▶ Example site](https://react-physics-dragger-demo.netlify.com/)

This is a React component which basically adds a wrapper element with horizontal dragging capabilities. It uses a little bit of physics to apply friction and boundary bouncing (similar to Apple's interfaces, and the [Flickity](https://flickity.metafizzy.co/) carousel).

* Works with both touch and mouse
* 0 dependencies
* Super small


## Example usage

```
yarn add react-physics-dragger
# or
npm i react-physics-dragger
```

It uses [ResizeObserver](https://caniuse.com/#search=resizeobserver) so you might need to add a polyfill. If so, instructions below.

```
import Dragger from 'react-physics-dragger'
import ResizeObserver from 'resize-observer-polyfill' // If you need a ResizeObserver polyfill, this one works pretty great

const App = () => {
  return (
    <Dragger
      className="dragger" // Pass in whatever classNames or styles you'd like
    >
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </Dragger>
  )
}
```

## Props
| Property         | Type              | Default | Description                                                                                                                                                                                      |
| :--------------- | :---------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ref`            | React Ref         |         | Optional. Use to access the components Ref methods (see below section "Ref Methods") and _Example1_.                                                                                             |
| `onFrame`        | callback function |         | Optional. This function is fired on every movement, resize, and mount. It provides one param object includes the `x` position, `progress` (from 0 to 1), and dragger dimensions. See _Example2_. |
| `onDown`        | callback function |         | Optional. Fired on mouse or touch press. |
| `onUp`        | callback function |         | Optional. Fired on mouse or touch release. |
| `disabled`       | boolean           | false   | Optional. Enable/disable the component.                                                                                                                                                          |
| `friction`       | number            | 0.92    | Optional. Lower values feel grippier, higher values feel slippier.                                                                                                                               |
| `ResizeObserver` |                   |         | Optional. If you need the polyfill pass it in as a prop.                                                                                                                                         |


## Ref Methods
| Property      | Type     | Description                                                                                          |
| :------------ | :------- | :--------------------------------------------------------------------------------------------------- |
| `setPosition` | function | Changes the position of the slider. `draggerRef.current.setPosition(x)` where `x` is the pixel value |

## Acknowledgements
Inspired by [Dave DeSandro's](https://twitter.com/desandro) work on Practical UI Physics; 
https://www.youtube.com/watch?v=90oMnMFozEE and https://codepen.io/desandro/pen/QbPKEq

This library was packaged with https://github.com/transitive-bullshit/create-react-library

## License

MIT © [nickmcmillan](https://github.com/nickmcmillan)
