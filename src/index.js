import React, { useEffect, useRef, useState } from 'react'
import { roundNum } from './utils'
import { applyDragForce, applyBoundForce } from './force'
import getBoundaries from './getBoundaries'

import styles from './styles.css'

export default function Dragger(props) {
  const draggerRefOuter = useRef()
  const draggerRefInner = useRef()

  const [settings, setSettings] = useState({
    friction: props.friction || 0.92,
  })

  const [state, setState] = useState({
    restPositionX: 0,
    isDragging: false,
  })

  const [leftBound, setLeftBound] = useState(0)
  const [rightBound, setRightBound] = useState(0)

  const docStyle = document.documentElement.style
  const [inputType, setInputType] = useState('')
  const [velocityX, setVelocityX] = useState(0)
  const [downX, setDownX] = useState(0)
  const [dragStartPosition, setDragStartPosition] = useState(0)
  const [nativePosition, setNativePosition] = useState(0) // starting position
  const [dragPosition, setDragPosition] = useState(nativePosition)
  const [rafId, setRafId] = useState(null)

  const [outerEl, setOuterEl] = useState(null)
  const [innerEl, setInnerEl] = useState(null)
  const [outerWidth, setOuterWidth] = useState(0)
  const [innerWidth, setInnerWidth] = useState(0)

  // componentDidMount
  useEffect(() => {
    setOuterEl(draggerRefOuter.current)
    setInnerEl(draggerRefInner.current)
    // need to use scrollWidth instead of offsetWidth
    setOuterWidth(outerEl.scrollWidth)
    setInnerWidth(innerEl.scrollWidth)

    const { left, right } = getBoundaries({
      outerWidth: outerWidth,
      innerWidth: innerWidth,
      elClientLeft: outerEl.clientLeft,
    })

    setLeftBound(left)
    setRightBound(right)

    // Update the edge boundaries when the outer element is resized
    // Update the inner width when the children change size
    // Check first if ResizeObserver is available on the window or if a polyfill is supplied by the user via props
    if (!window.ResizeObserver && !props.ResizeObserver) {
      throw new Error('No ResizeObserver is available. Please check the docs for instructions on how to add a polyfill.')
    }

    const Ro = window.ResizeObserver || props.ResizeObserver
    const observer = new Ro(entries => {
      // use the elements ID to determine whether the inner or the outer has been observed
      const id = entries[0].target.id
      if (id === 'Dragger-inner') setInnerWidth(entries[0].contentRect.width)
      if (id === 'Dragger-outer') setOuterWidth(entries[0].contentRect.width)

      const { left, right } = getBoundaries({
        outerWidth: outerWidth,
        innerWidth: innerWidth,
        elClientLeft: outerEl.clientLeft,
      })

      setLeftBound(left)
      setRightBound(right)

      // broadcast onFrame event on component mount, as well as when the inner or outer elements change size
      if (props.onFrame) {
        props.onFrame({
          x: roundNum(nativePosition),
          outerWidth: outerWidth,
          innerWidth: innerWidth,
          progress: roundNum((nativePosition) / (outerWidth - innerWidth)),
        })
      }
    })
    observer.observe(outerEl)
    observer.observe(innerEl)
  }, [])

  // componentDidUpdate
  useEffect(() => {
    setSettings({friction: props.friction})
  }, [props.friction, settings.friction])

  const update = () => {
    setVelocityX(velocityX * settings.friction)

    if (!state.isDragging && nativePosition < leftBound) {
      setVelocityX(applyBoundForce({
        bound: leftBound,
        edge: 'left',
        nativePosition: nativePosition,
        friction: settings.friction,
        velocityX: velocityX,
      }))
    }

    if (!state.isDragging && nativePosition > rightBound) {
      setVelocityX(applyBoundForce({
        bound: rightBound,
        edge: 'right',
        nativePosition: nativePosition,
        friction: settings.friction,
        velocityX: velocityX,
      }))
    }

    setVelocityX(applyDragForce({
      isDragging: state.isDragging,
      dragPosition: dragPosition,
      nativePosition: nativePosition,
      velocityX: velocityX,
    }))

    setNativePosition(nativePosition + velocityX)

    const isInfinitesimal = roundNum(Math.abs(velocityX)) < 0.001

    if (!state.isDragging && isInfinitesimal) {
      // no longer dragging and inertia has stopped
      window.cancelAnimationFrame(rafId)
      setState(state => ({ ...state, restPositionX: roundNum(nativePosition) }))
    } else {
      // bypass Reacts render method during animation, similar to react-spring
      draggerRefInner.current.style.transform = `translate3d(${roundNum(nativePosition)}px,0,0)`
      setRafId(window.requestAnimationFrame(update))
    }

    if (props.onFrame) {
      props.onFrame({
        x: roundNum(nativePosition),
        outerWidth: outerWidth,
        innerWidth: innerWidth,
        progress: roundNum((nativePosition) / (outerWidth - innerWidth)),
      })
    }
  }

  const onMove = (e) => {
    const x = inputType === 'mouse' ? e.pageX : e.touches[0].pageX
    const move = x - downX
    setDragPosition(dragStartPosition + move)
  }

  const onRelease = (e) => {
    setState(state => ({ ...state, isDragging: false }))

    // onRelease if the slider hasn't dragged sufficiently, classify it as a static click
    const moveVector = Math.abs(downX - e.pageX)
    if (moveVector < 20 && props.onStaticClick) {
      props.onStaticClick(e.target)
    }

    // Update html element styles
    docStyle.cursor = ''
    docStyle.userSelect = ''

    if (inputType === 'mouse') {
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

    setState(state => ({ ...state, isDragging: true }))
    window.cancelAnimationFrame(rafId) // cancel any existing loop
    setRafId(window.requestAnimationFrame(update)) // kick off a new loop

    setInputType(e.type === 'mousedown' ? 'mouse' : 'touch')

    // Update html element styles
    docStyle.cursor = 'grabbing'
    docStyle.userSelect = 'none'
    setDownX(inputType === 'mouse' ? e.pageX : e.touches[0].pageX)
    setDragStartPosition(nativePosition)

    onMove(e)

    if (inputType === 'mouse') {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onRelease)
    } else if (inputType === 'touch') {
      window.addEventListener('touchmove', onMove)
      window.addEventListener('touchend', onRelease)
    }
  }

  return (
    <div
      id='Dragger-outer'
      ref={draggerRefOuter}
      className={`${styles.outer} ${state.isDragging ? styles.isDragging : ''}${props.disabled ? ' is-disabled' : ''} ${props.className}`}
      onTouchStart={onStart}
      onMouseDown={onStart}
      style={{ ...props.style }}
    >
      <div
        id='Dragger-inner'
        ref={draggerRefInner}
        className={`${styles.inner} dragger-inner`}
        style={{ 'transform': `translateX(${state.restPositionX}px)` }}
      >
        {props.children}
      </div>
    </div>
  )
}
