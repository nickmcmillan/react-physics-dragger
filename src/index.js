import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { roundNum } from './utils'
import { applyDragForce, applyBoundForce } from './force'
import getBoundaries from './getBoundaries'

import styles from './styles.css'

export default function Dragger(props) {
  const draggerRefOuter = useRef()
  const draggerRefInner = useRef()

  const settings = useRef({
    friction: props.friction,
  })

  const state = useRef({
    restPositionX: 0,
    isDragging: false,
  })

  const leftBound = useRef(0)
  const rightBound = useRef(0)

  const docStyle = document.documentElement.style
  const inputType = useRef('')
  const velocityX = useRef(0)
  const downX = useRef(0)
  const dragStartPosition = useRef(0)
  const nativePosition = useRef(0) // starting position
  const dragPosition = useRef(nativePosition.current)
  const rafId = useRef(null)

  const outerEl = useRef(null)
  const innerEl = useRef(null)
  const outerWidth = useRef(0)
  const innerWidth = useRef(0)

  // componentDidMount
  useEffect(() => {
    outerEl.current = draggerRefOuter.current
    innerEl.current = draggerRefInner.current
    // need to use scrollWidth instead of offsetWidth
    outerWidth.current = outerEl.current.scrollWidth
    innerWidth.current = innerEl.current.scrollWidth

    const { left, right } = getBoundaries({
      outerWidth: outerWidth.current,
      innerWidth: innerWidth.current,
      elClientLeft: outerEl.current.clientLeft,
    })

    leftBound.current = left
    rightBound.current = right

    // Update the edge boundaries when the outer element is resized
    // Update the inner width when the children change size
    // Check first if ResizeObserver is available on the window or if a polyfill is supplied by the user via props
    if (!window.ResizeObserver && !props.ResizeObserver) {
      throw new Error('No ResizeObserver is available. Please check the docs for instructions on how to add a polyfill.')
    }

    const Ro = window.ResizeObserver || props.ResizeObserver
    const observer = new Ro(entries => {
      // use the elements ID to determine whether the inner or the outer has been observed
      const id = entries[0].target.dataset.id
      if (id === 'Dragger-inner') innerWidth.current = entries[0].contentRect.width
      if (id === 'Dragger-outer') outerWidth.current = entries[0].contentRect.width

      const { left, right } = getBoundaries({
        outerWidth: outerWidth.current,
        innerWidth: innerWidth.current,
        elClientLeft: outerEl.current.clientLeft,
      })

      leftBound.current = left
      rightBound.current = right

      // broadcast onFrame event on component mount, as well as when the inner or outer elements change size
      if (props.onFrame) {
        props.onFrame({
          x: roundNum(nativePosition.current),
          outerWidth: outerWidth.current,
          innerWidth: innerWidth.current,
          progress: roundNum((nativePosition.current) / (outerWidth.current - innerWidth.current)),
        })
      }
    })
    observer.observe(outerEl.current)
    observer.observe(innerEl.current)
  }, [])

  // componentDidUpdate
  useEffect(() => {
    if (props.friction) {
      settings.current = { friction: props.friction }
    }
  }, [props.friction])

  const update = () => {
    velocityX.current *= settings.current.friction

    if (!state.current.isDragging && nativePosition.current < leftBound.current) {
      velocityX.current = applyBoundForce({
        bound: leftBound.current,
        edge: 'left',
        nativePosition: nativePosition.current,
        friction: settings.current.friction,
        velocityX: velocityX.current,
      })
    }

    if (!state.current.isDragging && nativePosition.current > rightBound.current) {
      velocityX.current = applyBoundForce({
        bound: rightBound.current,
        edge: 'right',
        nativePosition: nativePosition.current,
        friction: settings.current.friction,
        velocityX: velocityX.current,
      })
    }

    velocityX.current = applyDragForce({
      isDragging: state.current.isDragging,
      dragPosition: dragPosition.current,
      nativePosition: nativePosition.current,
      velocityX: velocityX.current,
    })

    nativePosition.current += velocityX.current

    const isInfinitesimal = roundNum(Math.abs(velocityX.current)) < 0.001

    if (!state.current.isDragging && isInfinitesimal) {
      // no longer dragging and inertia has stopped
      window.cancelAnimationFrame(rafId.current)
      state.current = { ...state.current, restPositionX: roundNum(nativePosition.current) }
    } else {
      // bypass Reacts render method during animation, similar to react-spring
      draggerRefInner.current.style.transform = `translate3d(${roundNum(nativePosition.current)}px,0,0)`
      rafId.current = window.requestAnimationFrame(update)
    }

    if (props.onFrame) {
      props.onFrame({
        x: roundNum(nativePosition.current),
        outerWidth: outerWidth.current,
        innerWidth: innerWidth.current,
        progress: roundNum((nativePosition.current) / (outerWidth.current - innerWidth.current)),
      })
    }
  }

  const onMove = (e) => {
    const x = inputType.current === 'mouse' ? e.pageX : e.touches[0].pageX
    const moveVector = x - downX.current

    // gradually increase friction as the dragger is pulled beyond bounds
    // credit: https://github.com/metafizzy/flickity/blob/master/dist/flickity.pkgd.js#L2894
    let dragX = dragStartPosition.current + moveVector
    const originBound = Math.max(rightBound.current, dragStartPosition.current)
    dragX = dragX > originBound ? (dragX + originBound) * 0.5 : dragX
    const endBound = Math.min(leftBound.current, dragStartPosition.current)
    dragX = dragX < endBound ? (dragX + endBound) * 0.5 : dragX

    dragPosition.current = dragX
  }

  const onRelease = (e) => {
    state.current = { ...state.current, isDragging: false }

    // onRelease if the slider hasn't dragged sufficiently, classify it as a static click
    const moveVector = Math.abs(downX.current - e.pageX)
    if (moveVector < 20 && props.onStaticClick) {
      props.onStaticClick(e.target)
    }

    // Update html element styles
    docStyle.cursor = ''
    docStyle.userSelect = ''

    if (inputType.current === 'mouse') {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onRelease)
    } else {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onRelease)
    }
  }

  const onStart = (e) => {
    if (props.disabled) return

    // dismiss clicks from right or middle buttons
    // (credit: https://github.com/metafizzy/flickity/blob/e2706840532c0ce9c4fc25832e810ad4f9823b61/dist/flickity.pkgd.js#L2176)
    const mouseButton = e.button
    if (mouseButton && (mouseButton !== 0 && mouseButton !== 1)) return

    state.current = { ...state.current, isDragging: true }
    window.cancelAnimationFrame(rafId.current) // cancel any existing loop
    rafId.current = window.requestAnimationFrame(update) // kick off a new loop

    inputType.current = (e.type === 'mousedown' ? 'mouse' : 'touch')

    // Update html element styles
    docStyle.cursor = 'grabbing'
    docStyle.userSelect = 'none'
    downX.current = inputType.current === 'mouse' ? e.pageX : e.touches[0].pageX
    dragStartPosition.current = nativePosition.current

    onMove(e)

    if (inputType.current === 'mouse') {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onRelease)
    } else if (inputType.current === 'touch') {
      window.addEventListener('touchmove', onMove)
      window.addEventListener('touchend', onRelease)
    }
  }

  return (
    <div
      data-id='Dragger-outer'
      ref={draggerRefOuter}
      className={`${styles.outer} ${state.current.isDragging ? styles.isDragging : ''}${props.disabled ? ' is-disabled' : ''} ${props.className}`}
      onTouchStart={onStart}
      onMouseDown={onStart}
      style={{ ...props.style }}
    >
      <div
        data-id='Dragger-inner'
        ref={draggerRefInner}
        className={`${styles.inner} dragger-inner`}
        style={{ 'transform': `translateX(${state.current.restPositionX}px)` }}
      >
        {props.children}
      </div>
    </div>
  )
}

Dragger.propTypes = {
  friction: PropTypes.number,
  ResizeObserver: PropTypes.func,
  onFrame: PropTypes.func,
  onStaticClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
}

Dragger.defaultProps = {
  friction: 0.92,
  disabled: false,
}
