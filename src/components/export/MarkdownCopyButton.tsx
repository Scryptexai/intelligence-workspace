"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/helpers";

export function MarkdownCopyButton({
  content,
  label = "Copy as Markdown",
  variant = "outline",
  className,
}: {
  content: string;
  label?: string;
  variant?: "outline" | "ghost" | "secondary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("h-8 gap-1.5 text-[12px]", className)}
      onClick={copy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}
