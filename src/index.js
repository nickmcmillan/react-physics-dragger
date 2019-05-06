import * as React from 'react'
import styles from './styles.css'

// function goToPosition(pos) {
//   var distance = pos - positionX
//   var force = distance * (1 - this.settings.friction)
//   applyForce(force)
// }

export default class Dragger extends React.Component {

  constructor(props) {
    super(props)
    this.draggerRefOuter = React.createRef()
    this.draggerRefInner = React.createRef()

    this.settings = {
      friction: props.friction || 0.92,
      padding: props.padding || 0,
    }

    this.state = {
      restPositionX: this.settings.padding,
      isDragging: false,
    }

    this.leftBound = 0
    this.rightBound = 0

    this.docStyle = document.documentElement.style
    this.inputType = ''
    this.velocityX = 0
    this.downX = 0
    this.dragStartPosition = 0
    this.dragPosition = this.nativePosition
    this.nativePosition = this.settings.padding // starting position
    this.rafId = null

    this.outerEl = null
    this.innerEl = null
    this.outerWidth = 0
    this.innerWidth = 0

  }

  componentDidMount() {
    this.outerEl = this.draggerRefOuter.current
    this.innerEl = this.draggerRefInner.current
    this.outerWidth = this.outerEl.offsetWidth
    this.innerWidth = this.innerEl.offsetWidth

    this.leftBound = -this.innerWidth + this.outerWidth - this.settings.padding
    this.rightBound = this.outerEl.clientLeft + this.settings.padding

    // Update the edge boundaries when the outer element is resized
    // Check first if ResizeObserver is available on the window or if a polyfill is supplied by the user via props
    if (!window.ResizeObserver && !this.props.ResizeObserver) {
      throw new Error('No ResizeObserver is available. Please check the docs for a guide on how to add a polyfill.')
    }
    const Ro = window.ResizeObserver || this.props.ResizeObserver
    this.myObserver = new Ro(entries => {
      this.outerWidth = entries[0].contentRect.width
      this.setBoundaries(this.innerWidth, this.outerWidth)
      // this.rafId = window.requestAnimationFrame(this.update)
    })
    this.myObserver.observe(this.outerEl)

    if (this.props.onMove) {
      this.props.onMove({
        x: this.roundNum(this.nativePosition),
        outerWidth: this.outerWidth,
        innerWidth: this.innerWidth,
        progress: this.roundNum((this.nativePosition) / (this.outerWidth - this.innerWidth - this.settings.padding)),
      })
    }
  }

  componentDidUpdate(prevProps) {

    if (this.props.friction && this.settings.friction !== this.props.friction) {
      this.settings.friction = this.props.friction
    }

    if (this.props.padding && this.settings.padding !== this.props.padding) {
      this.settings.padding = this.props.padding
      this.outerWidth = this.outerEl.offsetWidth
      this.innerWidth = this.innerEl.offsetWidth
      this.setBoundaries(this.innerWidth, this.outerWidth)

      this.rafId = window.requestAnimationFrame(this.update)
    }

    const oldKeys = this.props.children.map(child => child.key)
    const newKeys = prevProps.children.map(child => child.key)
    const childrenChanged = this.areTwoArraysSame(oldKeys, newKeys)

    if (!childrenChanged) {
      this.outerWidth = this.outerEl.offsetWidth
      this.innerWidth = this.innerEl.offsetWidth
      this.setBoundaries(this.innerWidth, this.outerWidth)

      this.rafId = window.requestAnimationFrame(this.update)
    }
  }

  setBoundaries = () => {
    this.outerWidth = this.outerEl.offsetWidth
    this.innerWidth = this.innerEl.offsetWidth
    const innerIsLessThanOuter = this.innerWidth < this.outerWidth
    const leftEdge = this.outerEl.clientLeft + this.settings.padding
    const rightEdge = -this.innerWidth + this.outerWidth - this.settings.padding

    this.leftBound = innerIsLessThanOuter ? leftEdge : rightEdge
    this.rightBound = innerIsLessThanOuter ? rightEdge : leftEdge
  }

  areTwoArraysSame = (arr1, arr2) => arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])

  roundNum = num => Math.round(num * 1000) / 1000

  update = () => {
    this.velocityX *= this.settings.friction

    if (!this.state.isDragging && this.nativePosition < this.leftBound) this.applyBoundForce(this.leftBound, 'left')
    if (!this.state.isDragging && this.nativePosition > this.rightBound) this.applyBoundForce(this.rightBound, 'right')
    this.applyDragForce()
    this.nativePosition += this.velocityX

    const isInfinitesimal = this.roundNum(Math.abs(this.velocityX)) < 0.001

    if (!this.state.isDragging && isInfinitesimal) {
      // no longer dragging and inertia has stopped
      window.cancelAnimationFrame(this.rafId)
      this.setState({ restPositionX: this.roundNum(this.nativePosition) })
    } else {
      // bypass reacts render method
      this.draggerRefInner.current.style.transform = `translate3d(${this.roundNum(this.nativePosition)}px,0,0)`
      this.rafId = window.requestAnimationFrame(this.update)
    }

    if (this.props.onMove) {
      this.props.onMove({
        x: this.roundNum(this.nativePosition),
        outerWidth: this.outerWidth,
        innerWidth: this.innerWidth,
        progress: this.roundNum((this.nativePosition) / (this.outerWidth - this.innerWidth - this.settings.padding)),
      })
    }
  }

  applyBoundForce = (bound, edge) => {
    // bouncing past bound
    const distance = bound - this.nativePosition
    let force = distance * (1 - this.settings.friction)
    // calculate resting position with this force
    const rest = this.nativePosition + (this.velocityX + force) / (1 - this.settings.friction)
    // apply force if resting position is out of bounds
    if ((edge === 'right' && rest > bound) || (edge === 'left' && rest < bound)) {
      this.applyForce(force)
    } else {
      // if in bounds, apply force to align at bounds
      force = distance * (1 - this.settings.friction) - this.velocityX
      this.applyForce(force)
    }
  }

  applyDragForce = () => {
    if (!this.state.isDragging) return

    const dragVelocity = this.dragPosition - this.nativePosition
    const dragForce = dragVelocity - this.velocityX
    this.velocityX += dragForce
  }

  applyForce = (force) => {
    this.velocityX += force
  }

  onMove = (e) => {
    const x = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    const move = x - this.downX
    this.dragPosition = this.dragStartPosition + move
  }

  onRelease = (e) => {
    this.setState({ isDragging: false })

    // onRelease if the slider hasn't dragged sufficiently, classify it as a static click
    const moveVector = Math.abs(this.downX - e.pageX)
    if (moveVector < 20 && this.props.onStaticClick) {
      this.props.onStaticClick(e.target)
    }

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
    if (this.props.disabled) return

    this.setState({ isDragging: true })
    window.cancelAnimationFrame(this.rafId) // cancel any existing loop
    this.rafId = window.requestAnimationFrame(this.update) // kick off a new loop

    this.inputType = e.type === 'mousedown' ? 'mouse' : 'touch'

    // Update html element styles
    this.docStyle.cursor = 'grabbing'
    this.docStyle.userSelect = 'none'
    this.downX = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    this.dragStartPosition = this.nativePosition

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
    return (
      <div
        className={`${styles.outer} ${this.state.isDragging ? styles.isDragging : ''} ${this.props.disabled ? styles.isDisabled : ''} ${this.props.className}`}
        onTouchStart={this.onStart}
        onMouseDown={this.onStart}
        ref={this.draggerRefOuter}
        style={{ ...this.props.style }}
      >
        <div
          ref={this.draggerRefInner}
          className={`${styles.inner} dragger-inner`}
          style={{ 'transform': `translateX(${this.state.restPositionX}px)` }}
        >
          {this.props.children}
        </div>
      </div>
    )
  }
}
