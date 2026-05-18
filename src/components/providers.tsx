"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="yolklab-theme"
      themes={["light", "dark"]}
    >
      {children}
    </NextThemes>
  );
}
