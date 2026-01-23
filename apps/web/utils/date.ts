import dayjs from 'dayjs'

export const dateFmt = (
  date: Date | string,
  fmt: string = 'YYYY-MM-DD HH:mm:ss',
): string => {
  return dayjs(date).format(fmt)
}
