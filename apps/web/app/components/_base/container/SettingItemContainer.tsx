import type { ComponentWithClass } from '@/utils/type'
import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
type SettingContainerProps = PropsWithChildren<{
  title: string;
  Icon: ComponentWithClass
  extra?: string;
  containerClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  extraClassName?: string;
}>
const SettingContainer = ({
  title,
  Icon,
  children,
  extra,
  containerClassName,
  iconClassName,
  titleClassName,
  extraClassName,
}: SettingContainerProps) => {
  return (
    <div
      className={twMerge(
        'bg-linear-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100 mb-6',
        containerClassName,
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Icon
            className={twMerge('w-6 h-6 text-purple-600 mr-3', iconClassName)}
          />
          <h3
            className={twMerge(
              'text-xl font-semibold text-purple-700',
              titleClassName,
            )}
          >
            {title}
          </h3>
        </div>
        {extra && (
          <span
            className={twMerge(
              'text-sm text-purple-500 bg-purple-100 px-3 py-1 rounded-full',
              extraClassName,
            )}
          >
            {extra}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
export default memo(SettingContainer)
