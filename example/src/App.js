import React, { Component } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

import './index.css'

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
    parallax: 'none',
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
    this.setState({ items })
  }

  handleOnMove = val => {
    if (this.state.parallax === 'none') return
    const parallaxFactor = 3

    this.inputRefs.forEach(ref => {
      if (!ref) return
      let x 
      if (this.state.parallax === 'left') {
        x = val.x + ref.offsetLeft
      }
      if (this.state.parallax === 'center') {
        x = val.x + ref.offsetLeft - (val.outerWidth / parallaxFactor)
      }
      ref.style.transform = `translateX(${x / (parallaxFactor * 2) }px)`
    })
  }

  handleSelectChange = (e) => {
    console.log(e.target.value)
    this.setState({
      parallax: e.target.value
    })
    

  }

  render() {
    return (
      <div className="container">

        {/* <h1>React Physics Dragger</h1> */}

        <button onClick={this.handleDisable}>
          {this.state.disabled ? 'Dragger is disabled': 'Dragger is enabled'}
        </button>
        <button onClick={this.handleAddItem}>
          Add item
        </button>
        <button onClick={this.handleRemoveItem}>
          Remove item
        </button>
        <select name="parallax" id="parallax" onChange={this.handleSelectChange}>
          <option value="none">none</option>
          <option value="left">left</option>
          <option value="center">center</option>
          <option value="right">right</option>
        </select>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore perspiciatis, architecto velit amet ad a mollitia commodi nesciunt in consequuntur sit dolore iusto quas, aperiam repudiandae, non error laboriosam. Molestias!</p>
        <Dragger
          disabled={this.state.disabled}
          ResizeObserver={ResizeObserver}
          friction={0.9}
          padding={-16}
          onMove={this.handleOnMove}
          onLoaded={this.handleOnMove}
          className="dragger"
        >
          {this.state.items.map((item, i) => (
            <button className="btn" key={`${item}-${i}`}>
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
