export const roundNum = (num: number): number => Math.round(num * 1000) / 1000

// https://stackoverflow.com/a/16655847/2255980
export const isNumeric = (num: any) => Number(parseFloat(num)) == num
