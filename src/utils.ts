export const roundNum = (num: number): number => Math.round(num * 1000) / 1000


export function isMouseEvent(e: React.TouchEvent | React.MouseEvent): e is React.MouseEvent {
  return e && 'screenX' in e;
}