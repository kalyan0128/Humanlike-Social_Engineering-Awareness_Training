import React from "react";
import { cn } from "@/lib/utils";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer 
      className={cn(
        "w-full py-3 px-4 border-t border-neutral-200 text-center text-sm text-neutral-500 bg-neutral-50",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto">
        <p>This web application is currently under testing mode. Working on full version.</p>
      </div>
    </footer>
  );
}