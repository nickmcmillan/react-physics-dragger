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
      padding: 0,
      friction: 0.9,
      items: ['Cabbage', 'Turnip', 'Radish', 'Carrot', 'Biscuit', 'Crumpet', 'Scone', 'Jam']
    }
  }

  setRef = ref => {
    this.inputRefs.push(ref)
  }

  handleDisable = () => this.setState(prevState => ({ disabled: !prevState.disabled }))

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

  handlePaddingChange = e => {
    this.setState({
      padding: parseInt(e.target.value, 10) || 0
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
          <label htmlFor="padding">Padding (px): </label>
          <input type="number" onChange={this.handlePaddingChange} value={this.state.padding} />
          <label htmlFor="padding">Friction <span className="sub">(between 0.85 and 0.95 works best)</span>: </label>
          <input type="number" onChange={this.handleFrictionChange} value={this.state.friction} min="0.8" max="0.99" />
        </div>

        <Dragger
          disabled={this.state.disabled}
          ResizeObserver={ResizeObserver}
          friction={this.state.friction}
          padding={this.state.padding}
          onMove={this.handleOnMove}
          onStaticClick={this.handleStaticClick}
          className="dragger"
        >
          {this.state.items.map((item, i) => (
            <button className="item" key={`${item}-${i}`}>
              <div className="inner" ref={this.setRef}>{item}</div>
            </button>
          ))}
        </Dragger>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure omnis atque delectus ea laborum vel, dolorum accusantium. Similique esse ab repellendus impedit quae debitis odit in, totam soluta facere at. </p>
      </div>
    )
  }
}
