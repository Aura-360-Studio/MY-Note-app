import { useDroppable } from "@dnd-kit/core";
import type React from "react";
import type { ReactNode } from "react";
import type { NoteStatus } from "../../notes/types/note.types";

type BoardColumnProps = {
  status: NoteStatus;
  title: string;
  count: number;
  children: ReactNode;
};

export function BoardColumn({
  status,
  title,
  count,
  children
}: BoardColumnProps): React.JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status }
  });

  return (
    <div className="flex-1 min-w-0 rounded-3xl border border-border bg-[#131313] p-3 flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="mono-ui text-[11px] uppercase tracking-[0.12em] text-muted">
          {title}
        </h3>
        <span className="mono-ui rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[150px] space-y-2 rounded-2xl p-1 transition ${isOver ? "bg-[#2a2a2a]/70 ring-1 ring-accent/50" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
