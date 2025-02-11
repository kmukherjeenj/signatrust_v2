import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType>({ activeTab: '', setActiveTab: () => {} });

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className || ''}`}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={`tabs-list ${className || ''}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={`tab-trigger ${activeTab === value ? 'active' : ''} ${className || ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={`tab-content ${className || ''}`}>{children}</div>;
};