import { ReactNode } from "react";
import { Separator } from "../ui/separator";

interface ReportSectionProps {
  title: string;
  children: ReactNode;
}

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <Separator />
      <div className="prose prose-sm max-w-none text-foreground prose-li:text-foreground">
        {children}
      </div>
    </div>
  );
}
