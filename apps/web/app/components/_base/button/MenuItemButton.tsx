import { memo } from 'react'
import { twMerge } from 'tailwind-merge'

const buttonTheme = {
  common: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-blue-400 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-500',
  },
  warn: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500',
  },
  danger: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-red-400 to-pink-400 group-hover:from-red-500 group-hover:to-pink-500',
  },
}
const MenuItemButton = ({
  disabled,
  title,
  onClick,
  theme,
}: {
  disabled?: boolean;
  title: string;
  onClick: () => void;
  theme: 'common' | 'warn' | 'danger';
}) => {
  return (
    <button
      className={twMerge(
        'w-full text-left px-3 py-2 text-sm flex items-center space-x-3',
        !disabled && buttonTheme[theme].btn,
        disabled && 'text-gray-300 cursor-not-allowed',
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={twMerge(
          'w-4 h-4 rounded-full',
          !disabled && buttonTheme[theme].bg,
          disabled && 'bg-gray-300',
        )}
      ></div>
      <span className="font-medium">{title}</span>
    </button>
  )
}
export default memo(MenuItemButton)
