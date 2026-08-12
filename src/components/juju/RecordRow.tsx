import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export type RecordRowProps = {
  dotClass?: string;
  title: ReactNode;
  meta?: ReactNode;
  value?: ReactNode;
  valueCaption?: ReactNode;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
};

function Body({ dotClass, title, meta, value, valueCaption }: RecordRowProps) {
  return (
    <div className="flex w-full items-start gap-3 px-4 py-3.5 text-left">
      {dotClass && <span className={`mt-1.5 text-[10px] leading-none ${dotClass}`}>●</span>}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">{title}</p>
        {meta && <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>}
      </div>
      {(value !== undefined || valueCaption !== undefined) && (
        <div className="shrink-0 text-right">
          {value !== undefined && <p className="numeral text-sm text-foreground">{value}</p>}
          {valueCaption !== undefined && (
            <p className="numeral mt-0.5 text-[11px] text-muted-foreground">{valueCaption}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** One dense record line in a list — links, or acts as a button when given onClick. */
export function RecordRow(props: RecordRowProps) {
  const shell = "block w-full border-b border-border/70 transition-colors hover:bg-secondary/60";

  if (props.to) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link to={props.to as any} params={props.params as any} className={shell}>
        <Body {...props} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={shell}>
      <Body {...props} />
    </button>
  );
}
