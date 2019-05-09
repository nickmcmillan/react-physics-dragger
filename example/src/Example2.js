import React, { useState, useRef, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

import img0 from './imgs/0.jpg'
import img1 from './imgs/1.jpg'
import img2 from './imgs/2.jpg'
import img3 from './imgs/3.jpg'
import img4 from './imgs/4.jpg'
import img5 from './imgs/5.jpg'

const items = [
  {
    src: img0,
    id: 0,
  },
  {
    src: img1,
    id: 1,
  },
  {
    src: img2,
    id: 2,
  },
  {
    src: img3,
    id: 3,
  },
  {
    src: img4,
    id: 4,
  },
  {
    src: img5,
    id: 5,
  },
]

const Example2 = () => {

  const [frame, setFrame] = useState({})
  
  // https://stackoverflow.com/a/54940592/2255980
  const refArr = Array.from({ length: items.length }, a => useRef(null));
  
  useEffect(() => {
    const parallaxFactor = -10
    refArr.forEach(ref => {
      const x = (frame.x + ref.current.offsetLeft) / parallaxFactor
      ref.current.style.transform = `translateX(${x}px)`
    })
  }, [frame.x]) // we're only interested in changes to the 'x' value

  return (
    <section className="section">
      <h2>Using the onFrame callback</h2>
      <p>Use this to access values on each frame. You could use these values to achieve a parallax effect.</p>

      <pre>
        outerWidth: {frame.outerWidth}px<br />
        innerWidth: {frame.innerWidth}px<br />
        x: {frame.x}px<br />
        progress: {frame.progress} <br />
      </pre>

      <Dragger
        ResizeObserver={ResizeObserver}
        onFrame={frame => setFrame(frame)}
        className="dragger"
      >
        {items.map((item, i) => (
          <div className="item-img" key={item.id}>
            <img className="img" ref={refArr[i]} src={item.src} alt="" />
          </div>
        ))}
      </Dragger>

    </section>
  )
}

export default Example2
