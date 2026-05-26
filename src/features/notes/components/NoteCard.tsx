import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";
import type { Note } from "../types/note.types";
import { Trash2, Pin } from "lucide-react";
import { useNotesStore } from "../stores/useNotesStore";
import { useConfirmationStore } from "../../../shared/hooks/useConfirmationStore";

type NoteCardProps = {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function NoteCard({
  note,
  isSelected,
  onSelect
}: NoteCardProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: note.id
    });
  const removeNote = useNotesStore((state) => state.removeNote);
  const confirm = useConfirmationStore((state) => state.confirm);
  const isPinned = note.tags?.includes("pinned");

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1
      }}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(note.id)}
      className={`group relative cursor-grab rounded-3xl border p-4 transition ${
        isSelected
          ? "border-accent bg-[#2a2a2a]"
          : "border-border bg-panel hover:border-accent hover:bg-[#2a2a2a]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="truncate text-sm font-semibold flex-1 flex items-center gap-1.5">
          {isPinned && (
            <Pin
              size={12}
              className="text-[#00dbe9] fill-[#00dbe9]/20 flex-shrink-0 rotate-[45deg]"
            />
          )}
          <span className="truncate">{note.title || "Untitled note"}</span>
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            confirm({
              title: "Delete note?",
              message: "This will delete",
              targetName: note.title || "Untitled note",
              helperText: "This action cannot be undone.",
              confirmText: "Delete",
              onConfirm: () => void removeNote(note.id)
            });
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[#b9cacb] hover:text-red-400 rounded transition absolute right-3 top-3 bg-[#201f1f]/80 backdrop-blur-sm border border-border/40 hover:border-red-400/40"
          title="Delete Note"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <p className="mt-1 max-h-10 overflow-hidden text-[13px] text-muted pr-4">
        {note.content || "No content yet."}
      </p>
    </article>
  );
}
