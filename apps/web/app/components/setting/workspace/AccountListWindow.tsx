'use client'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import {
  RiArrowUpLine,
  RiCloseLine,
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
import { Select, Space, Tooltip } from 'antd'
import { useDownGradeOptions, useUpgradeOptions } from './hooks/use-up-down-grade-options'
import { useUpDownGradeDialog } from './hooks/use-up-down-dialog'

type ModalOperation = {
  sourceUser: string;
  onClose: () => void;
}

const AccountUpgradeDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { filterdOptions } = useUpgradeOptions(sourceUser)

  const { handleUpgrade } = useAccountActions()
  const {
    selectedGroups,
    setSelectedGroups,
    handleConfirm,
  } = useUpDownGradeDialog(sourceUser, onClose, handleUpgrade)

  return (
    <Dialog open={!!sourceUser} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiArrowUpLine className="w-6 h-6 text-white" />
                <DialogTitle className="text-lg font-semibold text-white">
                  账户升级
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 mb-14">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                为用户 <span className="font-medium text-gray-900">{sourceUser}</span> 选择要升级的权限组：
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择权限组
              </label>
              <Select
                mode="multiple"
                value={selectedGroups}
                onChange={setSelectedGroups}
                options={filterdOptions}
                placeholder="请选择要添加的权限组"
                className="w-full rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20"
                optionRender={opt => (
                  <Tooltip title={opt.data.tooltip}>
                    <Space>
                      <opt.data.icon />
                      <span>{opt.data.label}</span>
                    </Space>
                  </Tooltip>
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedGroups.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                确认升级
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
const AccountDowngradeDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { filterdOptions } = useDownGradeOptions(sourceUser)
  const { handleDownGrade } = useAccountActions()
  const {
    selectedGroups,
    setSelectedGroups,
    handleConfirm,
  } = useUpDownGradeDialog(sourceUser, onClose, handleDownGrade)

  return (
    <Dialog open={!!sourceUser} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiArrowUpLine className="w-6 h-6 text-white rotate-180" />
                <DialogTitle className="text-lg font-semibold text-white">
                  账户降级
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 mb-14">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                为用户 <span className="font-medium text-gray-900">{sourceUser}</span> 选择要降级的权限组：
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择权限组
              </label>
              <Select
                mode="multiple"
                value={selectedGroups}
                onChange={setSelectedGroups}
                options={filterdOptions}
                placeholder="请选择要移除的权限组"
                className="w-full rounded-lg border-gray-200 hover:border-amber-400 focus:border-amber-500 focus:ring-amber-500/20"
                optionRender={opt => (
                  <Tooltip title={opt.data.tooltip}>
                    <Space>
                      <opt.data.icon />
                      <span>{opt.data.label}</span>
                    </Space>
                  </Tooltip>
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedGroups.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                确认降级
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
const AccountDisableDialog = ({ sourceUser, onClose }: ModalOperation) => {
  const { handleDisable } = useAccountActions()

  const handleConfirm = () => {
    handleDisable(sourceUser)
    onClose()
  }

  return (
    <Dialog open={!!sourceUser} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-red-500 to-pink-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiForbidLine className="w-6 h-6 text-white" />
                <DialogTitle className="text-lg font-semibold text-white">
                  禁用账户
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <RiForbidLine className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                确认禁用账户
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                您确定要禁用用户 <span className="font-medium text-gray-900">{sourceUser}</span> 吗？
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>注意：</strong>账户被禁用后，用户将无法登录系统。此操作不可撤销。
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200"
              >
                确认禁用
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
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
                      <div className="p-2 rounded-full hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer group">
                        <RiMore2Fill className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                      </div>
                    </MenuButton>
                    <MenuItems
                      anchor="bottom"
                      className="mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100/50 z-50 overflow-hidden"
                    >
                      <div className="py-2">
                        <MenuItem>
                          <button
                            onClick={() =>
                              !account.isDisabled
                              && setUpgradleSelectedAccount(account.email)
                            }
                            className={twMerge(
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                              !account.isDisabled
                                && 'text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full',
                                !account.isDisabled
                                  && 'bg-linear-to-r from-blue-400 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-500',
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
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                              !account.isDisabled
                                && 'text-gray-700 hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full',
                                !account.isDisabled
                                  && 'bg-linear-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500',
                                account.isDisabled && 'bg-gray-300',
                              )}
                            ></div>
                            <span className="font-medium">账户降级</span>
                          </button>
                        </MenuItem>
                        <div className="mx-3 my-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>
                        <MenuItem>
                          <button
                            onClick={() =>
                              !account.isDisabled
                              && setDisableSelectedAccount(account.email)
                            }
                            className={twMerge(
                              'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                              !account.isDisabled
                                && ' text-red-600 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer group',
                              account.isDisabled
                                && 'text-gray-300 cursor-not-allowed',
                            )}
                          >
                            <div
                              className={twMerge(
                                'w-5 h-5 rounded-full',
                                !account.isDisabled
                                  && 'bg-linear-to-r from-red-400 to-pink-400 group-hover:from-red-500 group-hover:to-pink-500',
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
