import React, { createContext, useContext, useState } from 'react';

const SelectContext = createContext<{
  value: string;
  onChange: (value: string) => void;
}>({ value: '', onChange: () => {} });

export const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => {
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { value, onChange } = useContext(SelectContext);
  return (
    <button className={`select-trigger ${className || ''}`} onClick={() => onChange(value)}>
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder: string }) => {
  const { value } = useContext(SelectContext);
  return <span className="select-value">{value || placeholder}</span>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="select-content">{children}</div>;
};

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { onChange } = useContext(SelectContext);
  return (
    <div className="select-item" onClick={() => onChange(value)}>
      {children}
    </div>
  );
};