function getBoundaries({
  outerWidth,
  innerWidth,
  elClientLeft,
}) {
  const innerIsLessThanOuter = innerWidth < outerWidth
  const leftEdge = elClientLeft
  const rightEdge = -innerWidth + outerWidth

  return {
    left: innerIsLessThanOuter ? leftEdge : rightEdge,
    right: innerIsLessThanOuter ? rightEdge : leftEdge,
  }
}

export default getBoundaries
