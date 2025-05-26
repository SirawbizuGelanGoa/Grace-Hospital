
// src/components/tiktok-icon.tsx
import { cn } from "@/lib/utils";
import React from "react";

export const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-5 w-5", className)}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94H6.32c.1-.83.02-1.68.02-2.51.01-2.3.01-4.6-.01-6.89-.01-1.02-.33-2.03-.75-2.96-.31-.69-.72-1.33-1.15-1.96C4.23 9.03 4.22 9.03 4.21 9.02v-4.2c1.19.19 2.35.56 3.41 1.11.48.25.91.56 1.32.9.02-1.98 0-3.96-.01-5.94z"></path>
  </svg>
);
