import type { ChangeEvent, ForwardedRef } from 'react'
import { forwardRef } from 'react'

export type InputWrapperProps = { onValueChange?: (value: string) => void } & React.InputHTMLAttributes<HTMLInputElement>
const InputWrapper = ({ onValueChange, onChange: onChangeOrigin, ...props }: InputWrapperProps, ref: ForwardedRef<HTMLInputElement>) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    try{
      onValueChange?.(e.target.value)
    }
    finally{
      onChangeOrigin?.(e)
    }
  }
  return (
    <input {...props} ref={ref} onChange={onChange} />
  )
}
export default forwardRef(InputWrapper)
