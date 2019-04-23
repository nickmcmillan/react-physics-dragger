import * as React from 'react'
import styles from './styles.css'


let isDragging = false

// let this.mousedownX = 0
let dragStartPositionX = 0

// function goToPosition(pos) {
//   var distance = pos - positionX
//   var force = distance * this.settings.stiffness
//   applyForce(force)
// }

export default class Dragger extends React.Component {

  constructor(props) {
    super(props)
    this.draggerRef = React.createRef()
    this.draggerRefInner = React.createRef()

    this.settings = {
      stiffness: this.props.stiffness || 0.08,
      friction: this.props.friction || 0.92,
      padding: this.props.padding || 0,
    }

    this.state = {
      restPositionX: this.settings.padding
    }

    this.velocityX = 0
    this.mousedownX = 0
    this.dragPositionX = this.nativePositionX
    this.nativePositionX = this.settings.padding // starting position
  }

  componentDidMount() {
    const width = this.draggerRef.current.offsetWidth
    const widthInner = this.draggerRefInner.current.offsetWidth

    this.rightBound = this.draggerRef.current.clientLeft + this.settings.padding
    this.leftBound = -widthInner + width - this.settings.padding
    this.update()
  }

  update = () => {
    console.log('y')
    
    this.velocityX *= this.settings.friction

    this.applyLeftBoundForce()
    this.applyRightBoundForce()
    this.applyDragForce()
    this.nativePositionX += this.velocityX

    const isInfinitesimal = Math.round(Math.abs(this.velocityX) * 1000) / 1000 < 0.0001
    // if (isInfinitesimal && !isDragging) {
    //   // drag complete
    //   // this.velocityX = 0
    //   // this.mousedownX = 0
    //   // dragStartPositionX = 0
    //   this.setState({ restPositionX: this.nativePositionX })
    //   // window.cancelAnimationFrame(this.update)
    // } else {
    //   // bypass reacts render method
    //   this.draggerRefInner.current.style.transform = `translate3d(${Math.round(this.nativePositionX * 1000) / 1000}px,0,0)`
    // }
    this.setState({ restPositionX: this.nativePositionX })
    window.requestAnimationFrame(this.update)
  }

  applyRightBoundForce = () => {
    if (isDragging || this.nativePositionX < this.rightBound) return

    // bouncing past bound
    const distance = this.rightBound - this.nativePositionX
    let force = distance * this.settings.stiffness
    // calculate resting position with this force
    const rest = this.nativePositionX + (this.velocityX + force) / (1 - this.settings.friction)
    // apply force if resting position is out of bounds
    if (rest > this.rightBound) {
      this.applyForce(force)
    } else {
      // if in bounds, apply force to align at bounds
      force = distance * this.settings.stiffness - this.velocityX
      this.applyForce(force)
    }
  }

  applyLeftBoundForce = () => {
    if (isDragging || this.nativePositionX > this.leftBound) return

    const distance = this.leftBound - this.nativePositionX
    let force = distance * this.settings.stiffness
    const rest = this.nativePositionX + (this.velocityX + force) / (1 - this.settings.friction)

    if (rest < this.leftBound) {
      this.applyForce(force)
    } else {
      force = distance * this.settings.stiffness - this.velocityX
      this.applyForce(force)
    }
  }

  applyDragForce = () => {
    if (!isDragging) return

    const dragVelocity = this.dragPositionX - this.nativePositionX
    const dragForce = dragVelocity - this.velocityX
    this.applyForce(dragForce)
  }

  applyForce = (force) => {
    this.velocityX += force
  }

  onMouseMove = (e) => {
    // this.velocityX = 0
    // this.mousedownX = 0
    // dragStartPositionX = 0
    const moveX = e.pageX - this.mousedownX
    this.dragPositionX = dragStartPositionX + moveX
    e.preventDefault()
  }

  onMouseup = () => {
    isDragging = false
    document.documentElement.style.cursor = ''
  }

  // componentWillUnmount() {
  //   window.removeEventListener('mousemove', this.onMouseMove)
  //   window.removeEventListener('mouseup', this.onMouseup)
  //   window.removeEventListener('touchmove', this.onMouseMove)
  //   window.removeEventListener('touchend', this.onTouchEnd)

  // }

  onTouchEnd = () => {
    isDragging = false
  }

  handleTouchStart = (e) => {
    isDragging = true
    this.mousedownX = e.pageX
    dragStartPositionX = this.nativePositionX
    this.onMouseMove(e)
    this.update()
    // window.addEventListener('touchmove', this.onMouseMove)
    // window.addEventListener('touchend', this.onTouchEnd)
  }

  onMouseDown = (e) => {
    isDragging = true
    document.documentElement.style.cursor = 'grabbing'
    this.mousedownX = e.pageX
    dragStartPositionX = this.nativePositionX
    this.onMouseMove(e)
    // this.update()
  }

  render() {
    console.log('render')
    return (
      <section
        className={styles.timeline}
        onMouseUp={this.onMouseup}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onTouchStart={this.handleTouchStart}
        ref={this.draggerRef}
        style={{
          ...this.props.style
        }}
      >

        <div
          ref={this.draggerRefInner}
          className={styles.slider}
          style={{ 'transform': `translateX(${this.state.restPositionX}px)` }}
        >
          {this.props.children}
        </div>
      </section>

    )
  }
}
