import { memo, useMemo } from 'react'
import {
  AdapterConfigContecxt,
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
      <AdapterConfigContecxt.Provider value={form.adapterConfig}>
        <AdapterConfigSetterContext.Provider value={handleAdapterConfigChange}>
          <ConfigArea />
        </AdapterConfigSetterContext.Provider>
      </AdapterConfigContecxt.Provider>
    </div>
  )
}
export default memo(CreateBotWindow)
