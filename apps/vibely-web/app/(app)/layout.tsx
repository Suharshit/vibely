import { ReactNode } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
