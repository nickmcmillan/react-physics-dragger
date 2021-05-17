import React, { useState, useRef } from 'react'
import Dragger from 'react-physics-dragger'


const evilExes = [
  'Matthew Patel',
  'Lucas Lee',
  'Todd Ingram',
  'Roxanne "Roxie" Richter',
  'Kyle & Ken Katayanagi',
  'Gideon Gordon Graves',
]

const Example1 = () => {
  const [items, setItems] = useState([...evilExes])

  const frame = useRef(0)
  const [isDisabled, setIsDisabled] = useState(false)
  const [friction, setFriction] = useState(0.93)
  const [clickedItem, setClickedItem] = useState(null)
  const [isMounted, setIsMounted] = useState(true)
  const draggerRef = useRef<any>()

  return (
    <section className='section'>
      {isMounted &&
        <Dragger
          // Dragger internals are exposed via its ref
          draggerRef={r => draggerRef.current = r}
          disabled={isDisabled}
          friction={friction}
          onFrame={({x}) => frame.current = x}
          className='dragger'
          
          onStaticClick={(el) => {
          
            // @ts-ignore
            if (el.nodeName === 'BUTTON') setClickedItem(el.textContent)
          }}
        >
          {items.map((item, i) => (
            <button className='item-standard' key={`${item}-${i}`}>{item}</button>
          ))}
        </Dragger>
      }

      <div className='button-group'>
        <button className='btn' onClick={() => setIsDisabled(!isDisabled)}>
          {isDisabled ? 'Dragger is disabled' : 'Dragger is enabled'}
        </button>
        <button
          className='btn'
          onClick={() => {
            // Add one item to the end of the items list. Pick randomly from original array
            const updatedItems = [
              ...items,
              evilExes[Math.floor(Math.random() * evilExes.length)]
            ]
            setItems(updatedItems)
          }}
        >
          Add item
        </button>
        <button
          className='btn'
          onClick={() => {
            // Remove one item from the end of the array
            const updatedItems = items.slice(0, items.length - 1)
            setItems(updatedItems)
          }}
        >
          Remove item
        </button>
        <div className='btn'>
          <label htmlFor='friction'>Friction: </label>
          <input
            id='friction'
            type='range'
            // @ts-ignore
            onChange={e => setFriction(e.currentTarget.value)}
            value={friction}
            min='0.6'
            max='0.99'
            step='0.01'
          />
          <span className='sub'> {friction}</span>
        </div>
        
      </div>
      <div className='button-group'>
        <button
          className="btn"
          onClick={() => {
            const newPosition = frame.current - 200
            draggerRef.current.setPosition(newPosition)
          }}
        >
          -200px
        </button>
        <button
          className="btn"
          onClick={() => {
            const newPosition = frame.current + 200
            draggerRef.current.setPosition(newPosition)
          }}
        >
          +200px
        </button>
        <button
          className="btn"
          onClick={() => {
            draggerRef.current.setPosition(0)
          }}
        >
          Left edge
        </button>
        <button
          className="btn"
          onClick={() => {
            const outer = draggerRef.current.outerWidth
            const inner = draggerRef.current.innerWidth
            draggerRef.current.setPosition(outer - inner)
          }}
        >
          Right edge
        </button>
        <button
          className="btn"
          onClick={() => {
            draggerRef.current.setPosition(0, true)
          }}
        >
          Left edge (instant)
        </button>
        <button
          className="btn"
          onClick={() => {
            const outer = draggerRef.current.outerWidth
            const inner = draggerRef.current.innerWidth
            draggerRef.current.setPosition(outer - inner, true)
          }}
        >
          Right edge (instant)
        </button>
        <button
          className="btn"
          onClick={() => setIsMounted(!isMounted)}
        >
          {isMounted ? 'Unmount' : 'Mount'} component
        </button>
      </div>

      <h2>onStaticClick</h2>
      <p>
        Adding an onClick handler to an element within the dragger won't work as
        expected - as drags will be undesirably registered as ordinary clicks.
        onStaticClick is fired when a mouse (or touch) down and up occurs
        without the dragger being moved over a small threshold. Click an item in
        the above dragger to see it in use.
      </p>
      {clickedItem && <p>You clicked: {clickedItem}</p>}
    </section>
  )
}

export default Example1
