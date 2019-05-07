function getBoundaries({
  outerWidth,
  innerWidth,
  elClientLeft,
  padding,
}) {

  const innerIsLessThanOuter = innerWidth < outerWidth
  const leftEdge = elClientLeft + padding
  const rightEdge = -innerWidth + outerWidth - padding

  return {
    left: innerIsLessThanOuter ? leftEdge : rightEdge,
    right: innerIsLessThanOuter ? rightEdge : leftEdge,
  }
}

export default getBoundaries
