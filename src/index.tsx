import React, { useState, useEffect, useRef, ReactNode } from 'react'

import { applyDragForce, applyBoundForce } from './force'
import getBoundaries from './getBoundaries'
import { roundNum, isMouseEvent } from './utils'

type draggerRefParams = { 
  setPosition: (position: number, instant: boolean) => void
  outerWidth: number
  innerWidth: number
}

export type OnFrameType = {
  x: number
  outerWidth: number
  innerWidth: number
  progress: number
}

type TProps = {
  friction?: number
  disabled?: boolean
  setCursorStyles?: boolean
  draggerRef?: (args: draggerRefParams) => void
  onFrame?: (args: OnFrameType) => void
  onStaticClick?: (e: EventTarget) => void
  onDown?: () => void
  onUp?: () => void
  style?: React.CSSProperties
  innerStyle?: React.CSSProperties
  className?: string
  children: ReactNode
  ResizeObserverPolyfill?: Function
}



export default function Dragger({
  friction = 0.95,
  disabled = false,
  setCursorStyles = true,
  onFrame,
  onUp,
  onDown,
  onStaticClick,
  draggerRef,
  style,
  innerStyle,
  className,
  children,
  ResizeObserverPolyfill,
}: TProps) {

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

  // Dragging state
  const restPositionX = useRef(0)
  const velocityX = useRef(0)
  const downX = useRef(0)
  const dragStartPosition = useRef(0)
  const nativePosition = useRef(0) // starting position
  const dragPosition = useRef(nativePosition.current)

  const rafId = useRef<number | null>(null)

  const docStyle = typeof window !== 'undefined' ? document.documentElement.style : { cursor: '', userSelect: '' }
  const mouseCursorStyle = setCursorStyles && isDraggingStyle ? 'grabbing' : setCursorStyles ? 'grab' : undefined
  
  // componentDidMount
  useEffect(() => {
    outerWidth.current = outerEl.current!.scrollWidth
    innerWidth.current = innerEl.current!.scrollWidth

    const { left, right } = getBoundaries({
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
      
      if (id === 'dragger-inner') innerWidth.current = entries[0].contentRect.width
      if (id === 'dragger-outer') outerWidth.current = entries[0].contentRect.width

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


    return () => {
      observer.disconnect()
    }
  }, [])


  // setPosition is exposed via ref
  function setPosition(position: number, instant: boolean) {
    if (disabled) return
    const finalPosition = Math.min(Math.max(leftBound.current, position), rightBound.current)

    // jump instantly to position, without animation
    if (instant) {
      window.cancelAnimationFrame(rafId.current!) // cancel any existing loop
      if (innerEl.current) {
        nativePosition.current = finalPosition
        restPositionX.current = finalPosition
        innerEl.current.style.transform = `translate3d(${roundNum(finalPosition)}px,0,0)`

        if (onFrame) {
          onFrame({
            x: roundNum(nativePosition.current),
            outerWidth: outerWidth.current,
            innerWidth: innerWidth.current,
            progress: roundNum(nativePosition.current / (outerWidth.current - innerWidth.current))
          })
        }
      }
    } else {
      window.cancelAnimationFrame(rafId.current!) // cancel any existing loop
      rafId.current = window.requestAnimationFrame(() => updateLoop(finalPosition)) // kick off a new loop
    }
  }


  function updateLoop(optionalFinalPosition: null | number) {
    // bail out of the loop if the component has been unmounted
    if (!outerEl.current) {
      window.cancelAnimationFrame(rafId.current!)
      return
    }

    velocityX.current *= friction // apply friction to velocity, therefore slowing it down

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
      window.cancelAnimationFrame(rafId.current!)
      restPositionX.current = roundNum(nativePosition.current)
    } else {
      // bypass Reacts render method during animation, similar to react-spring
      if (innerEl.current) {
        innerEl.current.style.transform = `translate3d(${roundNum(nativePosition.current)}px,0,0)`
        rafId.current = window.requestAnimationFrame(() => updateLoop(null))
      }
    }

    // optional callback function prop
    if (onFrame) {
      onFrame({
        x: roundNum(nativePosition.current),
        outerWidth: outerWidth.current,
        innerWidth: innerWidth.current,
        progress: roundNum(nativePosition.current / (outerWidth.current - innerWidth.current))
      })
    }
  }

  function onMouseMove(e: any) {
    const x = e.pageX
    onMove(x)
  }
  
  function onTouchMove(e: any) {
    const x = e.touches[0].pageX
    onMove(x)
  }

  function onMove(x: number) {
    // gradually increase friction as the dragger is pulled beyond bounds
    // credit: https://github.com/metafizzy/flickity/blob/master/dist/flickity.pkgd.js#L2894
    const moveVector = x - downX.current
    let dragX = dragStartPosition.current + moveVector
    
    const originBound = Math.max(rightBound.current, dragStartPosition.current)
    if (dragX > originBound) {
      dragX = (dragX + originBound) * 0.5
    }

    const endBound = Math.min(leftBound.current, dragStartPosition.current)
    if (dragX < endBound) {
      dragX = (dragX + endBound) * 0.5
    }

    dragPosition.current = dragX
  }

  function onRelease(e: any) {
    isDragging.current = false
    setIsDraggingStyle(false)

    if (onUp) onUp() // optional props

    // if the slider hasn't dragged sufficiently treat it as a static click
    const moveVector = Math.abs(downX.current - e.pageX)
    if (moveVector < 20 && onStaticClick) {
      onStaticClick(e.target)
    }

    // Update html element styles
    if (setCursorStyles) {
      docStyle.cursor = ''
      docStyle.userSelect = ''
    }


    if (isMouseEvent(e)) {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onRelease)
    } else {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onRelease)
    }
  }

  function onMouseStart(e: React.MouseEvent) {
    if (disabled) return
    // dismiss clicks from right or middle buttons
    // (credit: https://github.com/metafizzy/flickity/blob/e2706840532c0ce9c4fc25832e810ad4f9823b61/dist/flickity.pkgd.js#L2176)
    const mouseButton = e.button
    if (mouseButton && mouseButton !== 0 && mouseButton !== 1) return

    isDragging.current = true
    setIsDraggingStyle(true)

    if (onDown) onDown() // Optional Prop

    // Update <html> element styles
    if (setCursorStyles) {
      docStyle.cursor = 'grabbing'
      docStyle.userSelect = 'none'
    }

    window.cancelAnimationFrame(rafId.current!) // cancel any existing loop
    rafId.current = window.requestAnimationFrame(() => updateLoop(null)) // kick off a new loop

    downX.current = e.pageX
    dragStartPosition.current = nativePosition.current

    onMouseMove(e) // initial onMove needed to set the starting mouse position
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onRelease)
  }

  function onTouchStart(e: React.TouchEvent) {
    if (disabled) return
    isDragging.current = true

    if (onDown) onDown() // Optional Prop

    window.cancelAnimationFrame(rafId.current!) // cancel any existing loop
    rafId.current = window.requestAnimationFrame(() => updateLoop(null)) // kick off a new loop

    downX.current = e.touches[0].pageX
    dragStartPosition.current = nativePosition.current    

    onTouchMove(e)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onRelease)
  }

  function onBlur() {
    // reset the browsers automatic container scrolling, caused by tabbing
    outerEl.current!.scrollTo(0, 0)
  }

  return (
    <div
      data-id='dragger-outer'
      ref={outerEl}
      className={[
        disabled ? ' is-disabled' : null,
        className,
      ].join(' ')}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseStart}
      onBlur={onBlur}
      style={{
        cursor: mouseCursorStyle,
        ...style,
      }}
    >
      <div
        data-id='dragger-inner'
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
