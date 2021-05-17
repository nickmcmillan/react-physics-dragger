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

Internally it uses [ResizeObserver](https://caniuse.com/#search=resizeobserver) so you might need to add a polyfill if you support IE11. If so, instructions below.

```
import Dragger from 'react-physics-dragger'
import ResizeObserver from 'resize-observer-polyfill' // this one works pretty great

const App = () => {
  return (
    <Dragger
      ResizeObserverPolyfill={ResizeObserver} // remember; only if you need it, else it uses window.ResizeObserver
    >
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </Dragger>
  )
}
```

## Props
| Property         | Type              | Default Value | Description                                                                                                                                                                                      |
| :--------------- | :---------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `friction`       | number            | 0.95    | Optional. Lower values feel grippier, higher values feel slippier.                            |
|`draggerRef`            | function         |         | Optional. Use to access the components internal methods (see below section "Ref Methods") and _Example1_.                                                                                             |
| `onFrame`        | callback function |         | Optional. This function is fired on every movement, resize, and mount. It provides one param object includes the `x` position, `progress` (from 0 to 1), and dragger dimensions. See _Example2_. |
| `onDown`        | callback function |         | Optional. Fired on mouse or touch press. |
| `onUp`        | callback function |         | Optional. Fired on mouse or touch release. |
| `onStaticClick`        | function |         | Optional. Fired when an item within the dragger is clicked (or tapped). Useful for avoiding events where dragging can be considered a click. |
| `setCursorStyles`        | boolean | true   | Optional. If enabled, styles are added/removed to the `<html>` element for grabbing cursor styles. |
| `className`        | string |    | Optional. Add your own class name to the outer element |
| `style`        | CSSProperties |    | Optional. Add your own styles to the outer element |
| `innerStyle`        | CSSProperties |    | Optional. Add your own styles to the inner element |
| `disabled`       | boolean           | false   | Optional. Enable/disable the component.                                                                                                                                                          |
 `ResizeObserverPolyfill` |                   |         | Optional. If you need the polyfill pass it in as a prop.                                                                                                                                         |


## Ref Methods
| Property      | Type     | Description                                                                                          |
| :------------ | :------- | :--------------------------------------------------------------------------------------------------- |
| `setPosition` | function | Changes the position of the slider. `draggerRef.current.setPosition(x, false)` where `x` is the pixel value. Accepts a second argument (boolean, false by default) which determines whether to move to setPosition value instantly. |

## Acknowledgements
Inspired by [Dave DeSandro's](https://twitter.com/desandro) work on Practical UI Physics; 
https://www.youtube.com/watch?v=90oMnMFozEE and https://codepen.io/desandro/pen/QbPKEq

This library was packaged with https://github.com/transitive-bullshit/create-react-library

## License

MIT © [nickmcmillan](https://github.com/nickmcmillan)
