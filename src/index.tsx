import React, { useState, useEffect, useRef, MouseEvent, ReactNode } from 'react'

import { roundNum } from './utils'
import { applyDragForce, applyBoundForce } from './force'
import getBoundaries from './getBoundaries'

type draggerRefParams = { setPosition: Function; outerWidth: number; innerWidth: number; }
type onFrameParams = { x: number; outerWidth: number; innerWidth: number; progress: number }

type TProps = {
  friction?: number
  ResizeObserverPolyfill?: any
  draggerRef?: (args: draggerRefParams) => void
  onFrame?: (args: onFrameParams) => void
  onStaticClick?: (e: EventTarget) => void
  onDown?: () => void
  onUp?: () => void
  setCursorStyles?: boolean
  disabled?: boolean
  className?: string
  style?: any
  innerStyle?: any
  children: ReactNode
}

export default function Dragger({
  friction = 0.92,
  disabled = false,
  setCursorStyles = true,
  onFrame,
  ResizeObserverPolyfill,
  onUp,
  onDown,
  onStaticClick,
  className,
  innerStyle,
  children,
  style,
  draggerRef,
}: TProps) {

  console.log('render')

  const docStyle = typeof window !== 'undefined' ? document.documentElement.style : { cursor: '', userSelect: ''}

  // DOM element refs
  const outerEl = useRef<HTMLDivElement>(null)
  const innerEl = useRef<HTMLDivElement>(null)

  // Dimensions
  const outerWidth = useRef(0)
  const innerWidth = useRef(0)
  const leftBound = useRef(0)
  const rightBound = useRef(0)

  // User input states
  const isDragging = useRef(false) // doesn't update render
  const [isDraggingStyle, setIsDraggingStyle] = useState(false) // does update render
  const inputType = useRef<'mouse' | 'touch' | ''>('')

  // Dragging state
  const restPositionX = useRef(0)
  const velocityX = useRef(0)
  const downX = useRef(0)
  const dragStartPosition = useRef(0)
  const nativePosition = useRef(0) // starting position
  const dragPosition = useRef(nativePosition.current)

  const rafId = useRef<any>(null)

  // componentDidMount
  useEffect(() => {
    outerWidth.current = outerEl.current!.scrollWidth
    innerWidth.current = innerEl.current!.scrollWidth

    const { left, right }: { left: number; right: number } = getBoundaries({
      outerWidth: outerWidth.current,
      innerWidth: innerWidth.current,
      elClientLeft: (outerEl.current && outerEl.current.clientLeft) || 0
    })

    leftBound.current = left
    rightBound.current = right

    // Update the edge boundaries when the outer element is resized
    // Update the inner width when the children change size
    // Check if ResizeObserver is available on the window, and if no polyfill is supplied by the user via props
    if (!(window as any).ResizeObserver && !ResizeObserverPolyfill) {
      throw new Error('No ResizeObserver is available. Please check the docs for instructions on how to add a polyfill.')
    }

    const Ro = (window as any).ResizeObserver || ResizeObserverPolyfill
    // address the 'any' typing of entries
    const observer = new Ro((entries: any[]) => {
      // use the elements data-id to determine whether the inner or the outer has been observed
      const id = entries[0].target.dataset.id
      if (id === 'Dragger-inner') innerWidth.current = entries[0].contentRect.width
      if (id === 'Dragger-outer') outerWidth.current = entries[0].contentRect.width

      const { left, right }: { left: number; right: number } = getBoundaries({
        outerWidth: outerWidth.current,
        innerWidth: innerWidth.current,
        elClientLeft: (outerEl.current && outerEl.current.clientLeft) || 0,
      })

      leftBound.current = left
      rightBound.current = right

      // broadcast onFrame event on component mount, as well as when the inner or outer elements change size
      if (onFrame) {
        onFrame({
          x: roundNum(nativePosition.current),
          outerWidth: outerWidth.current,
          innerWidth: innerWidth.current,
          progress: roundNum(nativePosition.current / (outerWidth.current - innerWidth.current)),
        })
      }

      // if a draggerRef has been provided, broadcast changes to it as well
      // and make the setPosition function available
      if (draggerRef) {
        draggerRef({
          setPosition,
          outerWidth: outerWidth.current,
          innerWidth: innerWidth.current,
        })
      }
    })

    observer.observe(outerEl.current)
    observer.observe(innerEl.current)

  }, [rightBound.current, leftBound.current]) // keep track of whether the component is disabled


  // setPosition is exposed via ref
  function setPosition(position: number) {
    if (disabled) return
    const finalPosition = Math.min(Math.max(leftBound.current, position), rightBound.current)
    window.cancelAnimationFrame(rafId.current) // cancel any existing loop
    rafId.current = window.requestAnimationFrame(() => updateLoop(finalPosition)) // kick off a new loop
  }

  function updateLoop(optionalFinalPosition: null | number) {
    // bail out of the loop if the component has been unmounted
    if (!outerEl.current) {
      window.cancelAnimationFrame(rafId.current)
      return
    }

    velocityX.current *= friction

    // if a number is provided as a param (optionalFinalPosition), move to that position
    if (optionalFinalPosition !== null) {

      const distance = optionalFinalPosition - nativePosition.current
      const force = distance * (1 - friction) - velocityX.current
      velocityX.current = velocityX.current + force // apply force

    } else {

      if (!isDragging.current && nativePosition.current < leftBound.current) {
        velocityX.current = applyBoundForce({
          bound: leftBound.current,
          edge: 'left',
          nativePosition: nativePosition.current,
          friction: friction,
          velocityX: velocityX.current,
        })
      }

      if (!isDragging.current && nativePosition.current > rightBound.current) {
        velocityX.current = applyBoundForce({
          bound: rightBound.current,
          edge: 'right',
          nativePosition: nativePosition.current,
          friction: friction,
          velocityX: velocityX.current,
        })
      }
    }

    velocityX.current = applyDragForce({
      isDragging: isDragging.current,
      dragPosition: dragPosition.current,
      nativePosition: nativePosition.current,
      velocityX: velocityX.current,
    })

    nativePosition.current += velocityX.current

    const isInfinitesimal: boolean = roundNum(Math.abs(velocityX.current)) < 0.001

    if (!isDragging.current && isInfinitesimal) {
      // no longer dragging and inertia has stopped
      window.cancelAnimationFrame(rafId.current)
      restPositionX.current = roundNum(nativePosition.current)
    } else {
      // bypass Reacts render method during animation, similar to react-spring
      if (innerEl.current) {
        innerEl.current.style.transform = `translate3d(${roundNum(nativePosition.current)}px,0,0)`
        rafId.current = window.requestAnimationFrame(() => updateLoop(null))
      }
    }

    if (onFrame) {
      onFrame({
        x: roundNum(nativePosition.current),
        outerWidth: outerWidth.current,
        innerWidth: innerWidth.current,
        progress: roundNum(nativePosition.current / (outerWidth.current - innerWidth.current))
      })
    }
  }

  // address 'any' typing of event // MouseEvent does not have property 'touches'
  function onMove(e: any) {
    const x: number = inputType.current === 'mouse' ? e.pageX : e.touches[0].pageX
    const moveVector: number = x - downX.current

    // gradually increase friction as the dragger is pulled beyond bounds
    // credit: https://github.com/metafizzy/flickity/blob/master/dist/flickity.pkgd.js#L2894
    let dragX: number = dragStartPosition.current + moveVector
    const originBound: number = Math.max(rightBound.current, dragStartPosition.current)
    dragX = dragX > originBound ? (dragX + originBound) * 0.5 : dragX
    const endBound: number = Math.min(leftBound.current, dragStartPosition.current)
    dragX = dragX < endBound ? (dragX + endBound) * 0.5 : dragX

    dragPosition.current = dragX
  }

  function onRelease(e: MouseEvent<any> | any) {
    isDragging.current = false
    setIsDraggingStyle(false)

    if (onUp) onUp()

    // if the slider hasn't dragged sufficiently treat it as a static click
    const moveVector: number = Math.abs(downX.current - e.pageX)
    if (moveVector < 20 && onStaticClick) {
      onStaticClick(e.target)
    }

    // Update html element styles
    if (setCursorStyles) {
      docStyle.cursor = ''
      docStyle.userSelect = ''
    }

    if (inputType.current === 'mouse') {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onRelease)
    } else {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onRelease)
    }
  }

  function onStart(e: MouseEvent<any> | any) {
    if (disabled) return

    // dismiss clicks from right or middle buttons
    // (credit: https://github.com/metafizzy/flickity/blob/e2706840532c0ce9c4fc25832e810ad4f9823b61/dist/flickity.pkgd.js#L2176)
    const mouseButton = e.button
    if (mouseButton && mouseButton !== 0 && mouseButton !== 1) return

    isDragging.current = true
    setIsDraggingStyle(true)

    if (onDown) onDown()

    window.cancelAnimationFrame(rafId.current) // cancel any existing loop
    rafId.current = window.requestAnimationFrame(() => updateLoop(null)) // kick off a new loop

    // Update <html> element styles
    if (setCursorStyles) {
      docStyle.cursor = 'grabbing'
      docStyle.userSelect = 'none'
    }

    inputType.current = e.type === 'mousedown' ? 'mouse' : 'touch'

    downX.current = inputType.current === 'mouse' ? e.pageX : e.touches[0].pageX
    dragStartPosition.current = nativePosition.current

    // initial onMove needed to set the starting mouse position
    onMove(e)

    if (inputType.current === 'mouse') {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onRelease)
    } else if (inputType.current === 'touch') {
      window.addEventListener('touchmove', onMove)
      window.addEventListener('touchend', onRelease)
    }
  }

  function onBlur() {
    // reset the browsers automatic container scrolling, caused by tabbing
    outerEl.current!.scrollTo(0, 0)
  }

  const cursor = setCursorStyles && isDraggingStyle ? 'grabbing' : setCursorStyles ? 'grab' : null

  return (
    <div
      data-id='Dragger-outer'
      ref={outerEl}
      className={[
        disabled ? ' is-disabled' : null,
        className,
      ].join(' ')}
      onTouchStart={onStart}
      onMouseDown={onStart}
      onBlur={onBlur}
      style={{
        cursor,
        ...style,
      }}
    >
      <div
        data-id='Dragger-inner'
        ref={innerEl}
        className='dragger-inner'
        style={{
          transform: `translateX(${restPositionX.current}px)`,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          willChange: 'transform',
          display: 'inline-block',

          ...innerStyle
        }}
      >
        {children}
      </div>
    </div>
  )
}
