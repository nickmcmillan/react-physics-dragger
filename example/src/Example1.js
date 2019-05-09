import React, { useState, useRef, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

const Example2 = () => {

  const [items, setItems] = useState(['Cabbage', 'Turnip', 'Radish', 'Carrot', 'Biscuit'])
  const [isDisabled, setIsDisabled] = useState(false)
  const [friction, setFriction] = useState(0.9)

  return (
    <div>
      <h2>Basic Example</h2>
      <div className="button-group">
        <button className="btn" onClick={() => setIsDisabled(!isDisabled)}>
          {isDisabled ? 'Dragger is disabled' : 'Dragger is enabled'}
        </button>
        <button
          className="btn" 
          onClick={() => {
            // Add a tomato to the end of the items list
            const updatedItems = [...items, 'Tomato']
            setItems(updatedItems)
          }}
        >
          Add item
          </button>
        <button
          className="btn"
          onClick={() => {
            // Remove one item from the end of the array
            const updatedItems = items.slice(0, items.length - 1)
            setItems(updatedItems)
          }}
        >
          Remove item
          </button>
      </div>
      <div className="button-group">
        <label htmlFor="friction">Friction: </label>
        <input
          id="friction"
          type="range"
          onChange={(e) => setFriction(e.currentTarget.value)}
          value={friction}
          min="0.8"
          max="0.95"
          step="0.01"
        />
        <span className="sub"> {friction}</span>
      </div>

      <Dragger
        disabled={isDisabled}
        ResizeObserver={ResizeObserver}
        friction={friction}
        onStaticClick={(e) => {
          console.log('Static click', e)
        }}
        className="dragger"
      >
        {items.map((item, i) => (
          <button className="item" key={`${item}-${i}`}>
            <div className="inner">{item}</div>
          </button>
        ))}
      </Dragger>
    </div>
  )
}

export default Example2
