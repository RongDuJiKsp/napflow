import dayjs from 'dayjs'

// 格式化时间戳
export const formatTimestamp = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

// 格式化字节大小
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
