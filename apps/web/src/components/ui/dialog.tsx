"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
        {children}
      </div>
    </>
  );
}

function DialogContent({ 
  className, 
  children,
  onClose 
}: { 
  className?: string; 
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-lg p-6 relative", className)}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-card-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold text-card-foreground", className)}>{children}</h2>;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function DialogTrigger({ asChild, children, onClick }: DialogTriggerProps) {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger };
