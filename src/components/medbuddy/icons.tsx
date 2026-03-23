import type { SVGProps } from "react";

export function MedBuddyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 2A4.95 4.95 0 0 1 16.95 6.95L16.95 6.95A4.95 4.95 0 0 1 12 11.9L12 11.9A4.95 4.95 0 0 1 7.05 6.95L7.05 6.95A4.95 4.95 0 0 1 12 2z" stroke="hsl(var(--primary))" />
      <path d="M12 12v10" stroke="hsl(var(--primary))" />
      <path d="M8 16h8" stroke="hsl(var(--primary))" />
      <path d="M9 2h6" stroke="hsl(var(--accent))" strokeWidth="1.5" />
      <path d="M12 12a7 7 0 0 0-7 7v3h14v-3a7 7 0 0 0-7-7z" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" />
    </svg>
  );
}
