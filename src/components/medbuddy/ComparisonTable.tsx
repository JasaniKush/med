import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Report } from "@/lib/types";

interface ComparisonTableProps {
  comparisons: Report['comparison'];
}

export function ComparisonTable({ comparisons }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Original Medical Term</TableHead>
            <TableHead>Simple Explanation</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {comparisons.map((item, index) => (
            <TableRow key={index}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.original}</TableCell>
                <TableCell className="font-medium">{item.simple}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
