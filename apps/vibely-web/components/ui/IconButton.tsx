import { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
}

export default function IconButton({
  children,
  active,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 outline-none
        ${active ? "bg-indigo-100 text-indigo-600" : "bg-white shadow-sm border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900"} 
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
