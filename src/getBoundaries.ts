interface BoundaryVariables {
    outerWidth: number;
    innerWidth: number;
    elClientLeft: number;
}
export default ({ outerWidth, innerWidth, elClientLeft }: BoundaryVariables): { left: number; right: number } => {
  const innerIsLessThanOuter: boolean = innerWidth < outerWidth
  const leftEdge: number = elClientLeft
  const rightEdge: number = -innerWidth + outerWidth

  return {
    left: innerIsLessThanOuter ? leftEdge : rightEdge,
    right: innerIsLessThanOuter ? rightEdge : leftEdge
  }
}
