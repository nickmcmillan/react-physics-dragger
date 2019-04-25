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
    this.draggerRefOuter = React.createRef()
    this.draggerRefInner = React.createRef()

    this.settings = {
      stiffness: props.stiffness || 0.08,
      friction: props.friction || 0.92,
      padding: props.padding || 0,
    }

    this.state = {
      restPositionX: this.settings.padding,
      isDragging: false,
    }

    this.docStyle = document.documentElement.style
    this.inputType = ''
    this.velocityX = 0
    this.downX = 0
    this.dragStartPositionX = 0
    this.dragPositionX = this.nativePositionX
    this.nativePositionX = this.settings.padding // starting position
    this.rafId = null
  }

  componentDidMount() {
    const widthOuter = this.draggerRefOuter.current.offsetWidth
    const widthInner = this.draggerRefInner.current.offsetWidth

    this.leftBound = -widthInner + widthOuter - this.settings.padding
    this.rightBound = this.draggerRefOuter.current.clientLeft + this.settings.padding
  }

  roundNum = num => Math.round(num * 1000) / 1000

  update = () => {
    this.velocityX *= this.settings.friction
    this.applyDragForce()

    if (!this.state.isDragging && this.nativePositionX < this.leftBound) this.applyBoundForce(this.leftBound, 'left')
    if (!this.state.isDragging && this.nativePositionX > this.rightBound) this.applyBoundForce(this.rightBound, 'right')
    this.nativePositionX += this.velocityX

    const isInfinitesimal = this.roundNum(Math.abs(this.velocityX)) < 0.001

    if (!this.state.isDragging && isInfinitesimal) {
      // no longer dragging and inertia has stopped
      window.cancelAnimationFrame(this.rafId)
      this.setState({ restPositionX: this.roundNum(this.nativePositionX) })
    } else {
      // bypass reacts render method
      this.draggerRefInner.current.style.transform = `translate3d(${this.roundNum(this.nativePositionX)}px,0,0)`
      this.rafId = window.requestAnimationFrame(this.update)
    }
  }

  applyBoundForce = (bound, edge) => {
    // bouncing past bound
    const distance = bound - this.nativePositionX
    let force = distance * this.settings.stiffness
    // calculate resting position with this force
    const rest = this.nativePositionX + (this.velocityX + force) / (1 - this.settings.friction)
    // apply force if resting position is out of bounds
    if ((edge === 'right' && rest > bound) || (edge === 'left' && rest < bound)) {
      this.applyForce(force)
    } else {
      // if in bounds, apply force to align at bounds
      force = distance * this.settings.stiffness - this.velocityX
      this.applyForce(force)
    }
  }

  applyDragForce = () => {
    if (!this.state.isDragging) return

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
    this.setState({ isDragging: false })

    // Update html element styles
    this.docStyle.cursor = ''
    this.docStyle.userSelect = ''

    if (this.inputType === 'mouse') {
      window.removeEventListener('mousemove', this.onMove)
      window.removeEventListener('mouseup', this.onRelease)
    } else {
      window.removeEventListener('touchmove', this.onMove)
      window.removeEventListener('touchend', this.onRelease)
    }
  }

  onStart = (e) => {
    this.setState({ isDragging: true })
    // console.log('start')
    window.cancelAnimationFrame(this.rafId) // cancel any existing loop
    this.rafId = window.requestAnimationFrame(this.update) // kick off a new loop

    this.inputType = e.type === 'mousedown' ? 'mouse' : 'touch'

    // Update html element styles
    this.docStyle.cursor = 'grabbing'
    this.docStyle.userSelect = 'none'
    this.downX = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
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
        ref={this.draggerRefOuter}
        style={{ 
          ...this.props.style,
          cursor: this.state.isDragging ? 'grabbing' : 'grab'
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
