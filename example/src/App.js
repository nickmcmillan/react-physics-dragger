import React, { Component } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import Dragger from 'react-physics-dragger'

export default class App extends Component {

  constructor (props) {
    super(props)
    this.inputRefs = []

    this.state = {
      disabled: false,
      parallax: 'none',
      friction: 0.9,
      frame: {
        progress: 0,
        x: 0,
        outerWidth: 0,
        innerWidth: 0,
      },
      items: ['Cabbage', 'Turnip', 'Radish', 'Carrot', 'Biscuit', 'Crumpet', 'Scone', 'Jam']
    }
  }

  setRef = ref => this.inputRefs.push(ref)

  handleDisable = () => this.setState(prevState => ({ disabled: !prevState.disabled }))

  handleAddItem = () => {
    // Add a tomato to the end of the items list
    const items = [...this.state.items, 'Tomato']
    this.setState({ items })
  }
  
  handleRemoveItem = () => {
    // Remove an item from the end of the array
    const items = this.state.items.slice(0, this.state.items.length - 1)
    this.setState({ items })
  }

  handleOnFrame = frame => {
    this.setState({ frame })
    
    if (this.state.parallax === 'none') return
    const parallaxFactor = 3

    this.inputRefs.forEach(ref => {
      if (!ref) return
      let x 
      if (this.state.parallax === 'left') {
        x = frame.x + ref.offsetLeft
      }
      if (this.state.parallax === 'center') {
        x = frame.x + ref.offsetLeft - (frame.outerWidth / parallaxFactor)
      }
      ref.style.transform = `translateX(${x / (parallaxFactor * 2) }px)`
    })
  }
  
  handleFrictionChange = e => {
    this.setState({
      friction: e.target.value
    })
  }

  handleSelectChange = e => {
    this.setState({
      parallax: e.target.value
    })
  }

  handleStaticClick = e => {
    console.log('static click', e)
  }

  render() {
    return (
      <div className="container">

        <h1>React Physics Dragger</h1>

        <div className="button-group">
          <button className="btn" onClick={this.handleDisable}>
            {this.state.disabled ? 'Dragger is disabled': 'Dragger is enabled'}
          </button>
          <button className="btn" onClick={this.handleAddItem}>
            Add item
          </button>
          <button className="btn" onClick={this.handleRemoveItem}>
            Remove item
          </button>
        </div>
        <div className="button-group">
          <label htmlFor="parallax">Parallax origin: </label>
          <select name="parallax" id="parallax" onChange={this.handleSelectChange}>
            <option value="none">none</option>
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
          <label htmlFor="friction">Friction <span className="sub">(between 0.85 and 0.95 works best)</span>: </label>
          <input id="friction" type="number" onChange={this.handleFrictionChange} value={this.state.friction} min="0.8" max="0.99" />
        </div>

        <Dragger
          disabled={this.state.disabled}
          ResizeObserver={ResizeObserver}
          friction={this.state.friction}
          onFrame={this.handleOnFrame}
          onStaticClick={this.handleStaticClick}
          className="dragger"
        >
          {this.state.items.map((item, i) => (
            <button className="item" key={`${item}-${i}`}>
              <div className="inner" ref={this.setRef}>{item}</div>
            </button>
          ))}
        </Dragger>

        <p>Use the `onFrame` callback to access the following data on each frame;</p>

        <div>
          outerWidth: {this.state.frame.outerWidth}px<br/>
          innerWidth: {this.state.frame.innerWidth}px<br/>
          x: {this.state.frame.x}px<br/>
          progress: {this.state.frame.progress} <br/>
        </div>

        <Dragger
          disabled={this.state.disabled}
          ResizeObserver={ResizeObserver}
          friction={this.state.friction}
          onFrame={this.handleOnFrame}
          onStaticClick={this.handleStaticClick}
          className="dragger"
        >
          {this.state.items.map((item, i) => (
            <button className="item" key={`${item}-${i}`}>
              <div className="inner" ref={this.setRef}>{item}</div>
            </button>
          ))}
        </Dragger>
        
      </div>
    )
  }
}
