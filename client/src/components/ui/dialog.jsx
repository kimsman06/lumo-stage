import React from "react";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">{children}</div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div
    className={`bg-background rounded-lg shadow-lg border animate-in fade-in-0 zoom-in-95 ${className}`}
  >
    {children}
  </div>
);

const DialogHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const DialogTitle = ({ children, className = "" }) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h2>
);

const DialogDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };