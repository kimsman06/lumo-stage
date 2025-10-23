import React, { useState } from "react";

const DropdownMenu = ({ trigger, children, open, onOpenChange }) => {
  return (
    <div className="relative">
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 z-50 rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className = "" }) => (
  <button
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export { DropdownMenu, DropdownMenuItem };