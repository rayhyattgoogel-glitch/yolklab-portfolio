"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X } from "lucide-react";
import Image from "next/image";
import type { ProductEntry } from "@/lib/content/types";

interface QrModalProps {
  open: boolean;
  onClose: () => void;
  entry: ProductEntry | null;
  productTitle: string;
}

export function QrModal({ open, onClose, entry, productTitle }: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) {
      setQrDataUrl(null);
      return;
    }
    if (entry.qr) {
      setQrDataUrl(entry.qr);
      return;
    }
    if (entry.url) {
      QRCode.toDataURL(entry.url, {
        margin: 1,
        width: 720,
        color: {
          dark: "#0d0c0a",
          light: "#fbf9f5",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [entry]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && entry && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 z-50 w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2"
              >
                <div className="relative">
                  {/* Pulsing gold halo */}
                  <motion.div
                    aria-hidden
                    animate={{
                      boxShadow: [
                        "0 0 0 0 var(--accent-soft)",
                        "0 0 60px 10px var(--accent-soft)",
                        "0 0 0 0 var(--accent-soft)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-sm pointer-events-none"
                  />

                  <div className="relative border border-accent bg-surface p-6 sm:p-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                          scan to enter
                        </div>
                        <Dialog.Title className="mt-2 font-display text-2xl tracking-tight text-foreground">
                          {productTitle}
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {entry.label}
                        </Dialog.Description>
                      </div>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                          aria-label="关闭"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </Dialog.Close>
                    </div>

                    {/* QR canvas — gold border, pure */}
                    <div className="relative aspect-square w-full overflow-hidden border border-accent bg-[#fbf9f5] p-4">
                      {qrDataUrl ? (
                        <Image
                          src={qrDataUrl}
                          alt={`${productTitle} QR code`}
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="(max-width: 420px) 90vw, 420px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-[#0d0c0a]">
                          generating…
                        </div>
                      )}
                      {/* Corner ticks */}
                      <Tick className="left-0 top-0" />
                      <Tick className="right-0 top-0 rotate-90" />
                      <Tick className="bottom-0 right-0 rotate-180" />
                      <Tick className="bottom-0 left-0 -rotate-90" />
                    </div>

                    {entry.appid && (
                      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        appid · {entry.appid}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Tick({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-3 w-3 ${className}`}
      style={{
        borderTop: "2px solid var(--accent)",
        borderLeft: "2px solid var(--accent)",
      }}
    />
  );
}
