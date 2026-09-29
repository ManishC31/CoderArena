type Props = {
  number: number;
  name: string;
  description: string;
};

// One stage of the Learn → Code → Test → Build → Push loop. On wide screens the number sits
// on the line WorkflowSection draws behind the steps.
export function WorkflowStep({ number, name, description }: Props) {
  return (
    <li className="flex gap-4 md:flex-col">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-background font-mono text-xs text-brand">
        {String(number).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
