'use client'
import {
  Dialog,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import {
  RiForbidLine,
  RiMailLine,
  RiMore2Fill,
  RiTimeLine,
  RiUserLine,
} from '@remixicon/react'
import { memo, useCallback, useMemo, useState } from 'react'
import SettingItemContainer from '../../_base/container/SettingItemContainer'
import { useAccountsQuery } from '@/app/hooks/query/use-accounts-query'
import { dateFmt } from '@/utils/date'
import { useAccountActions } from '../hooks/use-account-operators'
import { twMerge } from 'tailwind-merge'

type ModalOperation = {
  sourceUser: string;
  onClose: () => void;
}
const AccountUpgradeDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { handleUpgrade } = useAccountActions()

  return <Dialog open={!!sourceUser} onClose={onClose}>
    
  </Dialog>
}
const AccountDowngradeDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { handleDownGrade } = useAccountActions()
  return <Dialog open={!!sourceUser} onClose={onClose}>

  </Dialog>
}
const AccountDisableDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { handleDisable } = useAccountActions()
  return <Dialog open={!!sourceUser} onClose={onClose}>

  </Dialog>
}

const AccountSettingWindow = () => {
  const { data } = useAccountsQuery()
  const accounts = useMemo(
    () =>
      data?.map(account => ({
        ...account,
        id: account.email,
        isDisabled: account.disabledAt !== null,
        isAdmin: account.userGroup.map(x => x.groupType).includes('Admin'),
      })),
    [data],
  )
  const [upgradeSelectedAccount, setUpgradleSelectedAccount] = useState('')
  const [downGradeSelectedAccount, setDownGradeSelectedAccount] = useState('')
  const [disableSelectedAccount, setDisableSelectedAccount] = useState('')

  const closeAll = useCallback(() => {
    setUpgradleSelectedAccount('')
    setDownGradeSelectedAccount('')
    setDisableSelectedAccount('')
  }, [])

  return (
    <>
      <SettingItemContainer
        title="账户列表"
        Icon={RiUserLine}
        extra={` 共 ${accounts?.length ?? 'loading'} 个账户`}
      >
        <div className="space-y-4">
          {accounts?.map(account => (
            <div
              key={account.id}
              className={`bg-white rounded-lg p-4 border transition-all duration-200 ${
                account.isDisabled
                  ? 'border-red-200 bg-red-50 opacity-70'
                  : 'border-pink-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-linear-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {account.nickname.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">
                        {account.nickname}
                      </span>
                      {account.isAdmin && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                          管理员
                        </span>
                      )}
                      {account.isDisabled && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          已禁用
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <RiMailLine className="w-4 h-4 mr-1" />
                      <span>{account.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <RiTimeLine className="w-4 h-4 mr-1" />
                      <span>创建: {dateFmt(account.createdAt)}</span>
                    </div>
                    {account.isDisabled && account.disabledAt && (
                      <div className="flex items-center text-sm text-red-600">
                        <RiForbidLine className="w-4 h-4 mr-1" />
                        <span>禁用: {dateFmt(account.disabledAt)}</span>
                      </div>
                    )}
                  </div>
                  <Menu>
                    <MenuButton>
                      <div className="p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer group">
                        <RiMore2Fill className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors duration-200" />
                      </div>
                    </MenuButton>
                    <MenuItems
                      anchor="bottom"
                      className="mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100/50 z-50 overflow-hidden transition-all duration-200 ease-out"
                    >
                      <div className="py-2">
                        <MenuItem>
                          <button
                            onClick={() =>
                              !account.isDisabled
                              && setUpgradleSelectedAccount(account.email)
                            }
                            className={twMerge(
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-150 ease-in-out',
                              !account.isDisabled
                                && 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full transition-all duration-200',
                                !account.isDisabled
                                  && 'bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-500',
                                account.isDisabled && 'bg-gray-300',
                              )}
                            ></div>
                            <span className="font-medium">账户升级</span>
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() =>
                              !account.isDisabled
                              && setDownGradeSelectedAccount(account.email)
                            }
                            className={twMerge(
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-150 ease-in-out',
                              !account.isDisabled
                                && 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full transition-all duration-200',
                                !account.isDisabled
                                  && 'bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500',
                                account.isDisabled && 'bg-gray-300',
                              )}
                            ></div>
                            <span className="font-medium">账户降级</span>
                          </button>
                        </MenuItem>
                        <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <MenuItem>
                          <button
                            onClick={() =>
                              !account.isDisabled
                              && setDisableSelectedAccount(account.email)
                            }
                            className={twMerge(
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-all duration-150 ease-in-out',
                              !account.isDisabled
                                && ' text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full transition-all duration-200',
                                !account.isDisabled
                                  && 'bg-gradient-to-r from-red-400 to-pink-400 group-hover:from-red-500 group-hover:to-pink-500',
                                account.isDisabled && 'bg-gray-300',
                              )}
                            ></div>
                            <span className="font-medium">禁用账户</span>
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingItemContainer>
      <AccountUpgradeDialog
        sourceUser={upgradeSelectedAccount}
        onClose={closeAll}
      />
      <AccountDowngradeDialog
        sourceUser={downGradeSelectedAccount}
        onClose={closeAll}
      />
      <AccountDisableDialog
        sourceUser={disableSelectedAccount}
        onClose={closeAll}
      />
    </>
  )
}
export default memo(AccountSettingWindow)
