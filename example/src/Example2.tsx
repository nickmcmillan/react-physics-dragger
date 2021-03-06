import React, { useRef, useCallback, useState } from 'react'
import Dragger, {OnFrameType} from 'react-physics-dragger'

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
  const [log, setLog] = useState<OnFrameType>()


  // https://stackoverflow.com/a/54940592/2255980
  const innerRefArr = Array.from({ length: items.length }, () => useRef<HTMLImageElement>(null)) // eslint-disable-line
  const outerRefArr = Array.from({ length: items.length }, () => useRef<HTMLDivElement>(null)) // eslint-disable-line

  const onFrame = useCallback((frame: OnFrameType) => {

    // bypass Reacts render method to perform frequent style updates, similar concept to React Spring
    const parallaxFactor = -10
    innerRefArr.forEach((ref, i) => {
      const transformX = (frame.x + outerRefArr[i].current!.offsetLeft) / parallaxFactor
      ref.current!.style.transform = `translateX(${transformX}px)`
    })

     // And then only using state here to update the output log in the DOM
    setLog(frame)

  }, [innerRefArr, outerRefArr])


  return (
    <section className='section'>
      <h2>onFrame</h2>
      <p>
        onFrame is fired when the dragger is moved (and also once on mount). It
        provides the values printed below. You could use these to achieve some
        creative effects such as parallax;
      </p>

      <Dragger
        onFrame={onFrame}
        className='dragger'
        friction={0.95}
      >
        {items.map((item, i) => (
          <div className='item-img' key={item.id} ref={outerRefArr[i]}>
            <img className='img' ref={innerRefArr[i]} src={item.src} alt='' />
          </div>
        ))}
      </Dragger>

      {log &&
        <>
          <pre>
            outerWidth: {log.outerWidth}px
          <br />
            innerWidth: {log.innerWidth}px
          <br />
            x: {log.x}px
          <br />
            progress: {log.progress} <br />
          </pre>
        </>
      }
    </section>
  )
}

export default Example2
