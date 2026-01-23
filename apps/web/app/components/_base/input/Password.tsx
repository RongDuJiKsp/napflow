'use client'
import type { FocusEvent } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react'
import { autoUpdate, offset, useFloating } from '@floating-ui/react'
import { twMerge } from 'tailwind-merge'
import { STRENGTH_PASSWORD_LENGTH } from '../constants'
import type { Input } from '@heroui/react'
import { InputGroup, TextField } from '@heroui/react'
const checkPasswordComplexity = (password: string | undefined) => {
  const pwdFb = password ?? ''
  const checks = {
    length: pwdFb.length >= STRENGTH_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(pwdFb),
    lowercase: /[a-z]/.test(pwdFb),
    number: /\d/.test(pwdFb),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwdFb),
  }
  type Ret = { checks: Partial<typeof checks>; strength: number }
  if (!password) return { checks: {}, strength: 0 } as Ret

  const strength = Object.values(checks).filter(Boolean).length
  return { checks, strength } as Ret
}
export type PasswordProps = {
  value?: string | undefined;
  onValueChange?: (value: string) => void;
  enableComplexityCheck?: boolean;
  onComplexityCheck?: (res: {
    value: string | undefined;
    checks: ReturnType<typeof checkPasswordComplexity>;
  }) => void;
  className?: {
    // 如果使用wrapperClassName之类的直接属性部分插件不给补全 所以这里用className传对象的方式拉起补全
    group?: InputGroup['Props']['className'];
    input?: Input['Props']['className'];
    eye?: string;
  };
} & Omit<Input['Props'], 'value' | 'className'>

const Password = ({
  value,
  onValueChange,
  enableComplexityCheck = false,
  onComplexityCheck,
  onFocus: onFocusOrigin,
  onBlur: onBlurOrigin,
  className,
  ...props
}: PasswordProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showComplexityTooltip, setShowComplexityTooltip] = useState(false)

  const { refs, floatingStyles } = useFloating({
    open: showComplexityTooltip && enableComplexityCheck,
    onOpenChange: setShowComplexityTooltip,
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
    middleware: [offset({ mainAxis: 10, crossAxis: -8 })],
  })

  useEffect(() => {
    if (
      enableComplexityCheck
      && showComplexityTooltip
      && value
      && onComplexityCheck
    )
      onComplexityCheck({ value, checks: checkPasswordComplexity(value) })
  }, [enableComplexityCheck, showComplexityTooltip, value, onComplexityCheck])

  const onFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      onFocusOrigin?.(e)
      setShowComplexityTooltip(true)
    },
    [onFocusOrigin],
  )

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      onBlurOrigin?.(e)
      setShowComplexityTooltip(false)
    },
    [onBlurOrigin],
  )

  const { checks, strength } = useMemo(
    () => checkPasswordComplexity(value),
    [value],
  )

  return (
    <div>
      <TextField value={value} onChange={onValueChange}>
        <InputGroup
          ref={el => refs.setReference(el)}
          className={className?.group}
        >
          <InputGroup.Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            onFocus={onFocus}
            onBlur={onBlur}
            className={className?.input}
            {...props}
          />
          <InputGroup.Suffix>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={twMerge(
                'text-gray-400 hover:text-gray-600 focus:outline-none',
                className?.eye,
              )}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <RiEyeOffLine className="h-5 w-5" />
              ) : (
                <RiEyeLine className="h-5 w-5" />
              )}
            </button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
      {enableComplexityCheck && showComplexityTooltip && value && (
        <div
          ref={el => refs.setFloating(el)}
          style={floatingStyles}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64 z-50"
        >
          <div className="text-sm font-medium mb-2">密码强度检查</div>
          <div className="space-y-1">
            <div
              className={`flex items-center ${checks.length ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              至少8个字符
            </div>
            <div
              className={`flex items-center ${checks.uppercase ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              包含大写字母
            </div>
            <div
              className={`flex items-center ${checks.lowercase ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              包含小写字母
            </div>
            <div
              className={`flex items-center ${checks.number ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              包含数字
            </div>
            <div
              className={`flex items-center ${checks.special ? 'text-green-600' : 'text-red-600'}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              包含特殊字符
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">强度: {strength}/5</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={twMerge(
                  'h-2 rounded-full bg-green-500',
                  strength <= 3 && 'bg-yellow-500',
                  strength <= 2 && 'bg-red-500',
                )}
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(Password)
