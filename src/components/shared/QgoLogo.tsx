import { cn } from "@/lib/utils";

type QgoLogoProps = {
  className?: string;
};

export function QgoLogo({ className }: QgoLogoProps) {
  return (
    <h1 className={cn("qg-logo", className)}>
      Q&apos;go<span>Cargo</span>
    </h1>
  );
}
