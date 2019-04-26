import React, { Component } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

import 'reset-css';

export default class App extends Component {

  constructor (props) {
    super(props)
    this.inputRefs = []
  }

  setRef = (ref) => {
    this.inputRefs.push(ref)
  }

  state = {
    disabled: false,
    items: ['Cabbage', 'Turnip', 'Radish', 'Carrot', 'Biscuit', 'Crumpet', 'Scone', 'Jam']
  }

  handleDisable = () => {
    this.setState(prevState => {
      return {
        disabled: !prevState.disabled
      }
    })
  }

  handleAddItem = () => {
    const items = [...this.state.items, 'Tomato']
    this.setState({ items })
  }
  
  handleRemoveItem = () => {
    const items = [...this.state.items].splice(1, this.state.items.length)
    this.inputRefs = []
    this.setState({ items })
  }

  handleOnMove = val => {
    this.inputRefs.forEach(ref => {
      if (!ref) return
      const x = val.x + ref.offsetLeft
      ref.style.transform = `translateX(${ x / 8}px)`
    })
  }

  render() {
    return (
      <div>
        <button onClick={this.handleDisable}>
          {this.state.disabled ? 'Dragger is disabled': 'Dragger is enabled'}
        </button>
        <button onClick={this.handleAddItem}>
          Add item
        </button>
        <button onClick={this.handleRemoveItem}>
          Remove item
        </button>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore perspiciatis, architecto velit amet ad a mollitia commodi nesciunt in consequuntur sit dolore iusto quas, aperiam repudiandae, non error laboriosam. Molestias!</p>
        <Dragger
          disabled={this.state.disabled}
          ResizeObserver={ResizeObserver}
          friction={0.9}
          // padding={-16}
          onMove={this.handleOnMove}
          style={{
            // width: '300px',
            // height: '300px'
          }}
        >
          {this.state.items.map((item, i) => (
            <button
              className="btn" key={`${item}-${i}`}
            >
              <div
                className="inner"
                style={{
                  border: '1px solid pink',
                }}
                ref={this.setRef} 
              >
                {item}
              </div>
            </button>
          ))}
        </Dragger>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure omnis atque delectus ea laborum vel, dolorum accusantium. Similique esse ab repellendus impedit quae debitis odit in, totam soluta facere at. </p>
      </div>
    )
  }
}
