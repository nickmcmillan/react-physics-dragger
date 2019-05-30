interface BoundaryVariables {
    outerWidth: number;
    innerWidth: number;
    elClientLeft: number;
}
export default ({ outerWidth, innerWidth, elClientLeft }: BoundaryVariables): { left: number; right: number } => {
    const innerIsLessThanOuter = innerWidth < outerWidth
    const leftEdge = elClientLeft
    const rightEdge = -innerWidth + outerWidth

    return {
        left: innerIsLessThanOuter ? leftEdge : rightEdge,
        right: innerIsLessThanOuter ? rightEdge : leftEdge
    }
}
