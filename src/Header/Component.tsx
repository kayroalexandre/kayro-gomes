import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Header() {
  const headerData = await getCachedGlobal('header', 2)()

  return <HeaderClient data={headerData} />
}
