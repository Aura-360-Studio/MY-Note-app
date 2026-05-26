import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import type React from "react";
import type { Note, NoteStatus } from "../../notes/types/note.types";
import { NOTE_STATUSES } from "../../notes/types/note.types";
import { NoteCard } from "../../notes/components/NoteCard";
import { BoardColumn } from "./BoardColumn";

const COLUMN_LABELS: Record<NoteStatus, string> = {
  inbox: "Inbox",
  todo: "Todo",
  doing: "Doing",
  done: "Done",
  archive: "Archive"
};

type BoardViewProps = {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onMoveNote: (id: string, status: NoteStatus) => Promise<void>;
};

export function BoardView({
  notes,
  selectedNoteId,
  onMoveNote,
  onSelectNote
}: BoardViewProps): React.JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const activeId = String(event.active.id);
    const overDataStatus = event.over?.data.current?.status as
      | NoteStatus
      | undefined;
    const overId = event.over?.id ? String(event.over.id) : null;
    const overNoteStatus = overId
      ? notes.find((item) => item.id === overId)?.status
      : undefined;
    const overStatus = overDataStatus ?? overNoteStatus;
    if (!overStatus) {
      return;
    }
    const note = notes.find((item) => item.id === activeId);
    if (!note || note.status === overStatus) {
      return;
    }
    await onMoveNote(activeId, overStatus);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row w-full gap-4 pb-2">
        {NOTE_STATUSES.map((status) => {
          const columnNotes = notes
            .filter((note) => note.status === status)
            .sort((a, b) => {
              const aPinned = a.tags?.includes("pinned") ? 1 : 0;
              const bPinned = b.tags?.includes("pinned") ? 1 : 0;
              if (aPinned !== bPinned) {
                return bPinned - aPinned;
              }
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            });
          return (
            <BoardColumn
              key={status}
              status={status}
              title={COLUMN_LABELS[status]}
              count={columnNotes.length}
            >
              {columnNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={onSelectNote}
                />
              ))}
            </BoardColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
