import { createContext } from "react"

export interface TabContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const TabContext = createContext<TabContextType | undefined>(undefined)
