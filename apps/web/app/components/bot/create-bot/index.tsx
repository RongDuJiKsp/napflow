import { memo, useMemo } from 'react'
import {
  AdapterConfigSetterContext,
  useCreateBot,
} from './hooks/use-create-bot'
import { adapterComponent } from './constances'

const CreateBotWindow = () => {
  const { form, handleAdapterConfigChange } = useCreateBot()
  const ConfigArea = useMemo(
    () => adapterComponent[form.adapterTag],
    [form.adapterTag],
  )
  return (
    <div>
      Create
      <AdapterConfigSetterContext.Provider value={handleAdapterConfigChange}>
        <ConfigArea />
      </AdapterConfigSetterContext.Provider>
    </div>
  )
}
export default memo(CreateBotWindow)
