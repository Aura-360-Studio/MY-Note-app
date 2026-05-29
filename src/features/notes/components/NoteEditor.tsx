import { useState, useEffect, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { undo, redo } from "@codemirror/commands";
import type React from "react";
import type { Note } from "../types/note.types";
import { PomodoroTimer } from "./PomodoroTimer";

class ColorWidget extends WidgetType {
  constructor(readonly color: string) {
    super();
  }

  eq(other: ColorWidget) {
    return this.color === other.color;
  }

  toDOM() {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.width = "0.9em";
    span.style.height = "0.9em";
    span.style.marginRight = "4px";
    span.style.marginLeft = "2px";
    span.style.verticalAlign = "middle";
    span.style.border = "1px solid rgba(128, 128, 128, 0.5)";
    span.style.borderRadius = "2px";
    span.style.backgroundColor = this.color;
    span.style.cursor = "default";
    span.title = this.color;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

function getCssColor(match: string): string | null {
  const trimmed = match.trim();
  // 1. Starts with #
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (/^[0-9a-fA-F]{3,4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(hex)) {
      return trimmed;
    }
  }
  // 2. Standalone hex (no hash)
  if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(trimmed)) {
    // Must contain at least one digit to avoid matching common words like bed, coffee, etc.
    if (/[0-9]/.test(trimmed)) {
      return `#${trimmed}`;
    }
  }
  // 3. rgb/rgba
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(trimmed)) {
    return trimmed;
  }
  // 4. hsl/hsla
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

const colorDecorationPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.computeDecorations(view);
    }

    update(update: any) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.computeDecorations(update.view);
      }
    }

    computeDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      
      for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        
        // Match hex colors (with or without #) and rgb/rgba/hsl/hsla functions
        const regex = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)|hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)/gi;
        
        let match;
        while ((match = regex.exec(text)) !== null) {
          const matchStr = match[0];
          const color = getCssColor(matchStr);
          if (color) {
            const start = from + match.index;
            const deco = Decoration.widget({
              widget: new ColorWidget(color),
              side: -1
            });
            builder.add(start, start, deco);
          }
        }
      }
      
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations
  }
);

type NoteEditorProps = {
  note: Note | undefined;
  onChange: (id: string, changes: Partial<Note>) => Promise<void>;
  zoomPercent: number;
  wordWrap: boolean;
  showStatusBar: boolean;
  onZoomChange: (action: "in" | "out" | "reset") => void;
  fontFamily: string;
};

export function NoteEditor({
  note,
  onChange,
  zoomPercent,
  wordWrap,
  showStatusBar,
  onZoomChange,
  fontFamily
}: NoteEditorProps): React.JSX.Element {
  const [cursor, setCursor] = useState({ line: 1, col: 1, chars: 0 });
  const editorRef = useRef<any>(null);

  if (!note) {
    return (
      <section className="rounded-xl border border-border bg-[#131313] p-4 h-full flex items-center justify-center">
        <p className="text-sm text-muted">Create a note to start writing.</p>
      </section>
    );
  }

  const isPinned = note.tags?.includes("pinned");

  const togglePin = () => {
    const nextTags = isPinned
      ? note.tags.filter((t) => t !== "pinned")
      : [...(note.tags || []), "pinned"];
    void onChange(note.id, { tags: nextTags });
  };

  const handleFormat = (type: string) => {
    const view = editorRef.current?.view;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);

    let replacement = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case "strikethrough":
        replacement = `~~${selectedText || "strikethrough text"}~~`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](https://example.com)`;
        cursorOffset = selectedText ? replacement.length + 22 : 1;
        break;
      case "h1":
        replacement = `\n# ${selectedText || "Header 1"}\n`;
        cursorOffset = replacement.length;
        break;
      case "h2":
        replacement = `\n## ${selectedText || "Header 2"}\n`;
        cursorOffset = replacement.length;
        break;
      case "h3":
        replacement = `\n### ${selectedText || "Header 3"}\n`;
        cursorOffset = replacement.length;
        break;
      case "h4":
        replacement = `\n#### ${selectedText || "Header 4"}\n`;
        cursorOffset = replacement.length;
        break;
      case "paragraph":
        replacement = selectedText.replace(/^#+\s+/, "");
        cursorOffset = replacement.length;
        break;
      case "bullet-list":
        replacement = selectedText
          .split("\n")
          .map((line: string) => (line.startsWith("- ") ? line : `- ${line}`))
          .join("\n");
        cursorOffset = replacement.length;
        break;
      case "number-list":
        replacement = selectedText
          .split("\n")
          .map((line: string, idx: number) =>
            line.match(/^\d+\.\s+/) ? line : `${idx + 1}. ${line}`
          )
          .join("\n");
        cursorOffset = replacement.length;
        break;
      case "table":
        replacement = `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
        cursorOffset = replacement.length;
        break;
      case "clear-formatting":
        replacement = selectedText
          .replace(/^#+\s+/gm, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/~~(.*?)~~/g, "$1")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/^-\s+/gm, "")
          .replace(/^\d+\.\s+/gm, "");
        cursorOffset = replacement.length;
        break;
      case "datetime":
        const now = new Date();
        replacement =
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
          " " +
          now.toLocaleDateString();
        cursorOffset = replacement.length;
        break;
      case "clear-all":
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: "" }
        });
        return;
      case "undo":
        undo(view);
        return;
      case "redo":
        redo(view);
        return;
    }

    const transaction = view.state.update({
      changes: { from, to, insert: replacement },
      selection: { anchor: from + cursorOffset }
    });
    view.dispatch(transaction);
    view.focus();
  };

  useEffect(() => {
    const handleFormatEvent = (e: Event) => {
      const type = (e as CustomEvent).detail?.type;
      if (type) {
        handleFormat(type);
      }
    };
    window.addEventListener("format-editor", handleFormatEvent);
    return () => {
      window.removeEventListener("format-editor", handleFormatEvent);
    };
  }, [note]);

  const onUpdate = (viewUpdate: any) => {
    const state = viewUpdate.state;
    const doc = state.doc;
    const selection = state.selection.main;

    const chars = doc.length;
    const pos = selection.head;
    const line = doc.lineAt(pos);
    const lineNumber = line.number;
    const colNumber = pos - line.from + 1;

    setCursor({ line: lineNumber, col: colNumber, chars });
  };

  const extensions = useMemo(() => {
    const list: any[] = [markdown(), colorDecorationPlugin];
    if (wordWrap) {
      list.push(EditorView.lineWrapping);
    }
    return list;
  }, [wordWrap]);

  return (
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1] select-text">
      {/* Title Input & Pomodoro Focus Timer */}
      <div className="bg-[#131313] flex-shrink-0 flex items-center justify-between pr-6 border-b border-[#3b494b]/20">
        <input
          value={note.title}
          onChange={(event) =>
            void onChange(note.id, { title: event.target.value })
          }
          className="w-full bg-transparent pl-6 pr-4 py-4 text-base font-bold text-white outline-none border-none placeholder:text-[#555]"
          placeholder="Untitled note"
        />
        <div className="flex-shrink-0">
          <PomodoroTimer />
        </div>
      </div>

      {/* CodeMirror Text Editor */}
      <div
        className="flex-1 overflow-auto min-h-0 bg-[#131313] px-2"
        style={{ fontSize: `${zoomPercent}%`, fontFamily: fontFamily }}
      >
        <CodeMirror
          ref={editorRef}
          value={note.content}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          onUpdate={onUpdate}
          onChange={(value) => void onChange(note.id, { content: value })}
        />
      </div>

      {/* Bottom Status Bar */}
      {showStatusBar && (
        <div className="flex h-7 items-center justify-between border-t border-[#3b494b] bg-[#1a1a1a] px-4 text-[11px] text-[#b9cacb] select-none flex-shrink-0">
          <div className="flex items-center gap-6">
            <span>
              Ln {cursor.line}, Col {cursor.col}
            </span>
            <span>{cursor.chars} characters</span>
          </div>
          <div className="flex items-center h-full">
            <div className="h-full px-4 flex items-center border-l border-[#3b494b]/40 hover:bg-[#2a2a2a] cursor-pointer">
              Markdown
            </div>
            <div
              className="h-full px-4 flex items-center border-l border-[#3b494b]/40 hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => onZoomChange("reset")}
              title="Click to reset zoom"
            >
              {zoomPercent}%
            </div>
            <div className="h-full px-4 flex items-center border-l border-[#3b494b]/40">
              Windows (CRLF)
            </div>
            <div className="h-full px-4 flex items-center border-l border-[#3b494b]/40">
              UTF-8
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
