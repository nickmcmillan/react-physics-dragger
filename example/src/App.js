import React, { Component } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

import 'reset-css';

export default class App extends Component {

  state = {
    disabled: false,
    items: ['Cabbage', 'Turnip', 'Radish', 'Carrot']
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
    this.setState({ items })
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
          padding={0}
          style={{
            // width: '300px',
            height: '300px'
          }}
        >
          {this.state.items.map((item, i) => (
            <button className="btn" key={`${item}-${i}`}>{item}</button>
          ))}
        </Dragger>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure omnis atque delectus ea laborum vel, dolorum accusantium. Similique esse ab repellendus impedit quae debitis odit in, totam soluta facere at. </p>
      </div>
    )
  }
}
