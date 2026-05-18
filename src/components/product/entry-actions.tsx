"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Globe,
  Github,
  Download,
  Smartphone,
  QrCode,
  AppWindow,
  ArrowUpRight,
} from "lucide-react";
import { QrModal } from "@/components/qr/qr-modal";
import type { ProductEntry } from "@/lib/content/types";

interface EntryActionsProps {
  entries: ProductEntry[];
  productTitle: string;
}

const KIND_META: Record<
  ProductEntry["kind"],
  { Icon: typeof Globe; tone: "primary" | "ghost" }
> = {
  web: { Icon: Globe, tone: "primary" },
  appstore: { Icon: AppWindow, tone: "primary" },
  googleplay: { Icon: AppWindow, tone: "primary" },
  download: { Icon: Download, tone: "primary" },
  wechat: { Icon: QrCode, tone: "primary" },
  "mini-app": { Icon: Smartphone, tone: "primary" },
  source: { Icon: Github, tone: "ghost" },
};

export function EntryActions({ entries, productTitle }: EntryActionsProps) {
  const [qrEntry, setQrEntry] = useState<ProductEntry | null>(null);

  if (entries.length === 0) {
    return (
      <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
        — 暂无可用入口 —
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {entries.map((e, i) => {
          const meta = KIND_META[e.kind] ?? KIND_META.web;
          const { Icon, tone } = meta;
          const isQr = e.kind === "wechat" || (!e.url && !!e.qr);

          if (isQr) {
            return (
              <ActionShell
                key={`${e.kind}-${i}`}
                tone={tone}
                onClick={() => setQrEntry(e)}
                as="button"
              >
                <Icon size={14} strokeWidth={1.5} />
                <span>{e.label}</span>
                <ScanGlyph />
              </ActionShell>
            );
          }

          if (!e.url) return null;

          return (
            <ActionShell
              key={`${e.kind}-${i}`}
              tone={tone}
              as="a"
              href={e.url}
              external={e.url.startsWith("http")}
            >
              <Icon size={14} strokeWidth={1.5} />
              <span>{e.label}</span>
              <ArrowUpRight
                size={13}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </ActionShell>
          );
        })}
      </div>

      <QrModal
        open={qrEntry !== null}
        onClose={() => setQrEntry(null)}
        entry={qrEntry}
        productTitle={productTitle}
      />
    </>
  );
}

interface ShellPropsBase {
  tone: "primary" | "ghost";
  children: React.ReactNode;
}

type ShellProps =
  | (ShellPropsBase & { as: "button"; onClick: () => void })
  | (ShellPropsBase & {
      as: "a";
      href: string;
      external?: boolean;
    });

function ActionShell(props: ShellProps) {
  const { tone, children } = props;
  const className = `group/btn relative inline-flex items-center gap-2.5 border px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] transition-all duration-300 ease-out ${
    tone === "primary"
      ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
  }`;

  if (props.as === "button") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={props.onClick}
        className={className}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <Link
      href={props.href}
      {...(props.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={className}
    >
      {children}
    </Link>
  );
}

function ScanGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className="transition-transform duration-300 group-hover/btn:scale-110"
      aria-hidden
    >
      <path
        d="M0 0v3h1V1h2V0H0Zm9 0v1h2v2h1V0H9ZM0 9v3h3v-1H1V9H0Zm11 0v2H9v1h3V9h-1Z"
        fill="currentColor"
      />
    </svg>
  );
}
