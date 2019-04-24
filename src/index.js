import * as React from 'react'
import styles from './styles.css'

let isDragging = false

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

    this.inputType = ''
    this.velocityX = 0
    this.downX = 0
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

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseup)
    window.removeEventListener('touchmove', this.onMouseMove)
    window.removeEventListener('touchend', this.onTouchEnd)
  }

  update = () => {

    this.velocityX *= this.settings.friction
    

    // this.applyBoundForce(-400)
    // this.applyBoundForce()
    this.applyLeftBoundForce()
    this.applyRightBoundForce()
    this.applyDragForce()
    this.nativePositionX += this.velocityX

    const isInfinitesimal = Math.round(Math.abs(this.velocityX) * 1000) / 1000 < 0.0001
    // console.log(isDragging)
    
    if (isInfinitesimal && !isDragging) {
      // console.log('stop')
      
      // window.cancelAnimationFrame(this.update)
      // return
    }
    // if (isInfinitesimal && !isDragging) {
    //   // drag complete
    //   // this.velocityX = 0
    //   // this.downX = 0
    //   // dragStartPositionX = 0
    //   this.setState({ restPositionX: this.nativePositionX })
    //   // window.cancelAnimationFrame(this.update)
    // } else {
    //   // bypass reacts render method
    //   this.draggerRefInner.current.style.transform = `translate3d(${Math.round(this.nativePositionX * 1000) / 1000}px,0,0)`
    // }
    window.requestAnimationFrame(this.update)
    this.setState({ restPositionX: this.nativePositionX })
    
  }

  applyBoundForce = (bound) => {
    if (isDragging || this.nativePositionX < bound) return

    // bouncing past bound
    const distance = bound - this.nativePositionX
    let force = distance * this.settings.stiffness
    // calculate resting position with this force
    const rest = this.nativePositionX + (this.velocityX + force) / (1 - this.settings.friction)
    // apply force if resting position is out of bounds
    if (rest > bound) {
      this.applyForce(force)
    } else {
      // if in bounds, apply force to align at bounds
      force = distance * this.settings.stiffness - this.velocityX
      this.applyForce(force)
    }
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

  onMove = (e) => {
    const x = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    const moveX = x - this.downX
    this.dragPositionX = dragStartPositionX + moveX
    // e.preventDefault()
  }

  onRelease = () => {
    isDragging = false
    document.documentElement.style.cursor = ''
    const isInfinitesimal = Math.round(Math.abs(this.velocityX) * 1000) / 1000 < 0.0001

    // if (isInfinitesimal) {
    //   window.cancelAnimationFrame(this.update)
    // }
  }

  onStart = (e) => {
    this.inputType = e.type === 'mousedown' ? 'mouse' : 'touch'

    isDragging = true
    document.documentElement.style.cursor = 'grabbing'
    this.downX = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    dragStartPositionX = this.nativePositionX
    this.onMove(e)

    if (this.inputType === 'mouse') {
      window.addEventListener('mousemove', this.onMove)
      window.addEventListener('mouseup', this.onRelease)
    } else {
      window.addEventListener('touchmove', this.onMove)
      window.addEventListener('touchend', this.onRelease)
    }
  }

  render() {
    // console.log('render')
    return (
      <section
        className={styles.timeline}
        onTouchStart={this.onStart}
        onMouseDown={this.onStart}
        ref={this.draggerRef}
        style={{
          ...this.props.style,
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
