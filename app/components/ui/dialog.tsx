import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (isOpen: boolean) => void }) => {
  return (
    <DialogContext.Provider value={{ isOpen: open, setIsOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setIsOpen } = useContext(DialogContext);
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => setIsOpen(true),
    });
  }
  return <button onClick={() => setIsOpen(true)}>{children}</button>;
};

export const DialogContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = useContext(DialogContext);
  if (!isOpen) return null;
  return (
    <div className="dialog-overlay" onClick={() => setIsOpen(false)}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="dialog-header">{children}</div>;
};

export const DialogFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="dialog-footer">{children}</div>;
};

export const DialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="dialog-title">{children}</h2>;
};

export const DialogDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="dialog-description">{children}</p>;
};