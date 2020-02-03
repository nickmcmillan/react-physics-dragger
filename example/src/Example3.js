import React, { useCallback, useRef } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

function reverseNumber(num, min, max) {
  return max + min - num
}

const Example2 = () => {
  const ref = useRef(null)

  // bypass Reacts render method to perform frequent style updates, similar concept to React Spring
  const onFrame = useCallback(({ progress }) => {
    const opacity = reverseNumber(progress, 0, 1)
    ref.current.style.opacity = opacity
  }, [])

  return (
    <section className='section'>
      <p>Or you could use onFrame to change other CSS properties...</p>

      <Dragger
        ResizeObserver={ResizeObserver}
        onFrame={onFrame}
        className='dragger'
      >
        <div className='item-standard' ref={ref}>
          You once were a ve-gone, but now... you will be gone →
        </div>
      </Dragger>
    </section>
  )
}

export default Example2
