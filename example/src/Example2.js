import React, { useState, useRef, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

const items = ['Cabbage', 'Turnip', 'Radish', 'Carrot', 'Biscuit', 'Crumpet', 'Scone', 'Jam']

const Example2 = () => {

  const [frame, setFrame] = useState({})
  
  // https://stackoverflow.com/a/54940592/2255980
  const refArr = Array.from({ length: items.length }, a => useRef(null));
  
  useEffect(() => {
    const parallaxFactor = 10
    refArr.forEach(ref => {
      const x = (frame.x + ref.current.offsetLeft) / parallaxFactor
      ref.current.style.transform = `translateX(${x}px)`
    })
  }, [frame.x]) // we're only interested in changes to the 'x' value

  return (
    <div>
      <h2>Using the onFrame callback</h2>
      <p>Use this to access information about the dragger on each frame. You could use these values to achieve a parallax effect.</p>

      <p>
        outerWidth: {frame.outerWidth}px<br />
        innerWidth: {frame.innerWidth}px<br />
        x: {frame.x}px<br />
        progress: {frame.progress} <br />
      </p>

      <Dragger
        ResizeObserver={ResizeObserver}
        onFrame={frame => setFrame(frame)}
      >
        {items.map((item, i) => (
          <button className="item" key={`${item}-${i}`}>
            <div className="inner" ref={refArr[i]}>{item}</div>
          </button>
        ))}
      </Dragger>

    </div>
  )
}

export default Example2
