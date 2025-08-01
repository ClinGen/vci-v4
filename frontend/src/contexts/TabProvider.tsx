import { useState, type ReactNode } from "react"
import { TabContext } from "./TabContext"

interface TabProviderProps {
  children: ReactNode
}

export function TabProvider({ children }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState("predicted-effect")
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}
