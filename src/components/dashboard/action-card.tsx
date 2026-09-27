import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  children?: React.ReactNode;
};

// Dashboard card that opens its parent <Dialog>. The trigger's ::after overlay
// stretches over the whole card, so clicking anywhere on it opens the dialog.
export function ActionCard({ icon, title, description, actionLabel, children }: Props) {
  return (
    <Card className="group relative gap-0 p-6 transition-shadow hover:shadow-md hover:ring-foreground/20">
      {icon}
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {children && <div className="mt-5">{children}</div>}
      <DialogTrigger className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
        {actionLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </DialogTrigger>
    </Card>
  );
}
