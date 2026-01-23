import LoginWindow from '@/app/components/account/login-window'
export default function Page() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center">
      <div className="mx-auto min-w-md">
        <LoginWindow />
      </div>
    </div>
  )
}
