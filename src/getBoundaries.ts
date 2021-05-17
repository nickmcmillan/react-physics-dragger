type GetBoundariesProps = {
  outerWidth: number
  innerWidth: number
  elClientLeft: number
}

export default function getBoundaries({
  outerWidth,
  innerWidth,
  elClientLeft,
}: GetBoundariesProps): { left: number; right: number } {
  
  const innerIsLessThanOuter = innerWidth < outerWidth
  const leftEdge = elClientLeft
  const rightEdge = -innerWidth + outerWidth

  return {
    left: innerIsLessThanOuter ? leftEdge : rightEdge,
    right: innerIsLessThanOuter ? rightEdge : leftEdge
  }
}
