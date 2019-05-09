// Inspired by Dave DeSandro's (@desandro) work on Practical UI Physics
// https://www.youtube.com/watch?v=90oMnMFozEE
// https://codepen.io/desandro/pen/QbPKEq

function applyForce({ velocityX, force }) {
  return velocityX + force
}

export function applyDragForce({ isDragging, dragPosition, nativePosition, velocityX }) {
  if (!isDragging) return velocityX

  const dragVelocity = dragPosition - nativePosition
  const dragForce = dragVelocity - velocityX
  return velocityX + dragForce
}

export function applyBoundForce({ bound, edge, nativePosition, friction, velocityX }) {
  // bouncing past bound
  const distance = bound - nativePosition
  let force = distance * (1 - friction)
  // calculate resting position with this force
  const rest = nativePosition + (velocityX + force) / (1 - friction)
  // apply force if resting position is out of bounds
  if ((edge === 'right' && rest > bound) || (edge === 'left' && rest < bound)) {
    return applyForce({ velocityX, force })
  } else {
    // if in bounds, apply force to align at bounds
    force = distance * (1 - friction) - velocityX
    return applyForce({ velocityX, force })
  }
}
