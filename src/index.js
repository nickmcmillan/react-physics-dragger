import * as React from 'react'
import styles from './styles.css'




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
      stiffness: props.stiffness || 0.08,
      friction: props.friction || 0.92,
      padding: props.padding || 0,
    }

    this.state = {
      restPositionX: this.settings.padding
    }

    this.isDragging = false
    this.inputType = ''
    this.velocityX = 0
    this.downX = 0
    this.dragStartPositionX = 0
    this.dragPositionX = this.nativePositionX
    this.nativePositionX = this.settings.padding // starting position
    this.rafId = null
  }

  componentDidMount() {
    const width = this.draggerRef.current.offsetWidth
    const widthInner = this.draggerRefInner.current.offsetWidth

    this.rightBound = this.draggerRef.current.clientLeft + this.settings.padding
    this.leftBound = -widthInner + width - this.settings.padding
    // this.update()
  }

  // componentWillUnmount() {
  //   window.removeEventListener('mousemove', this.onMouseMove)
  //   window.removeEventListener('mouseup', this.onMouseup)
  //   window.removeEventListener('touchmove', this.onMouseMove)
  //   window.removeEventListener('touchend', this.onTouchEnd)
  // }

  update = () => {
    this.velocityX *= this.settings.friction
    this.applyDragForce()

    if (!this.isDragging && this.nativePositionX < this.leftBound) this.applyLeftBoundForce()
    if (!this.isDragging && this.nativePositionX > this.rightBound) this.applyRightBoundForce()
    this.nativePositionX += this.velocityX

    const isInfinitesimal = Math.round(Math.abs(this.velocityX) * 1000) / 1000 < 0.0001

    if (isInfinitesimal && !this.isDragging) {
      // console.log('stop')
      window.cancelAnimationFrame(this.rafId)
      this.setState({ restPositionX: this.nativePositionX })
    } else {
      // bypass reacts render method
      this.draggerRefInner.current.style.transform = `translate3d(${Math.round(this.nativePositionX * 1000) / 1000}px,0,0)`
      this.rafId = window.requestAnimationFrame(this.update)
    }
  }

  applyRightBoundForce = () => {
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
    if (!this.isDragging) return

    const dragVelocity = this.dragPositionX - this.nativePositionX
    const dragForce = dragVelocity - this.velocityX
    this.velocityX += dragForce
  }

  applyForce = (force) => {
    this.velocityX += force
  }

  onMove = (e) => {
    const x = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    const moveX = x - this.downX
    this.dragPositionX = this.dragStartPositionX + moveX
  }

  onRelease = () => {
    this.isDragging = false
    document.documentElement.style.cursor = ''

    if (this.inputType === 'mouse') {
      window.removeEventListener('mousemove', this.onMove)
      window.removeEventListener('mouseup', this.onRelease)
    } else {
      window.removeEventListener('touchmove', this.onMove)
      window.removeEventListener('touchend', this.onRelease)
    }
  }

  onStart = (e) => {
    // console.log('start')
    window.cancelAnimationFrame(this.rafId) // cancel any existing loop
    this.rafId = window.requestAnimationFrame(this.update) // kick off a new loop

    this.inputType = e.type === 'mousedown' ? 'mouse' : 'touch'

    document.documentElement.style.cursor = 'grabbing'
    this.downX = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    this.isDragging = true
    this.dragStartPositionX = this.nativePositionX

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
    console.log('render')
    return (
      <section
        className={styles.timeline}
        onTouchStart={this.onStart}
        onMouseDown={this.onStart}
        ref={this.draggerRef}
        style={{ ...this.props.style }}
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
