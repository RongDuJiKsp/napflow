import CreateAppWindow from '@/app/components/workflow/create-app'
export default function Page() {
  return (
    <div className='pt-64 w-screen flex flex-col justify-center'>
      <div className='mx-auto min-w-md'>
        <CreateAppWindow />
      </div>
    </div>
  )
}
