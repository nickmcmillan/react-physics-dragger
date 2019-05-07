
export const areTwoArraysSame = (arr1, arr2) => arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])

export const roundNum = num => Math.round(num * 1000) / 1000
