export type Account = {
  id: string
  nickname: string
  email: string
  createdAt: string
  isDisabled: boolean
  disabledAt?: string
  isAdmin: boolean
}

export const mockAccounts: Account[] = [
  {
    id: '1',
    nickname: '张三',
    email: 'zhangsan@example.com',
    createdAt: '2024-01-15 10:30:00',
    isDisabled: false,
    isAdmin: true,
  },
  {
    id: '2',
    nickname: '李四',
    email: 'lisi@example.com',
    createdAt: '2024-02-20 14:20:00',
    isDisabled: false,
    isAdmin: false,
  },
  {
    id: '3',
    nickname: '王五',
    email: 'wangwu@example.com',
    createdAt: '2024-03-10 09:15:00',
    isDisabled: true,
    disabledAt: '2024-11-28 16:45:00',
    isAdmin: false,
  },
  {
    id: '4',
    nickname: '赵六',
    email: 'zhaoliu@example.com',
    createdAt: '2024-04-05 11:00:00',
    isDisabled: false,
    isAdmin: false,
  },
  {
    id: '5',
    nickname: '钱七',
    email: 'qianqi@example.com',
    createdAt: '2024-05-12 13:25:00',
    isDisabled: true,
    disabledAt: '2024-12-01 10:30:00',
    isAdmin: false,
  },
]

export const currentUser = {
  isAdmin: true,
}
