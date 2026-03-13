import { ReactNode } from "react";

interface EventGridProps {
  children: ReactNode;
}

export default function EventGrid({ children }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-8 w-full">
      {children}
    </div>
  );
}
