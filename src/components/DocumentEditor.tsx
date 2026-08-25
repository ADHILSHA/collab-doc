"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const AUTOSAVE_DELAY_MS = 1000;

export function DocumentEditor({
  documentId,
  initialContent,
}: {
  documentId: string;
  initialContent: JSONContent;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(content: JSONContent) {
    setStatus("saving");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-[60vh] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(
        () => save(editor.getJSON()),
        AUTOSAVE_DELAY_MS,
      );
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} status={status} />
      <div className="rounded-b-lg border border-t-0 border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor, status }: { editor: Editor; status: string }) {
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive("bold") ?? false,
      italic: ctx.editor?.isActive("italic") ?? false,
      underline: ctx.editor?.isActive("underline") ?? false,
      h1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      h2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      paragraph: ctx.editor?.isActive("paragraph") ?? false,
      bulletList: ctx.editor?.isActive("bulletList") ?? false,
      orderedList: ctx.editor?.isActive("orderedList") ?? false,
    }),
  });

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50">
      <ToolbarButton
        active={state.bold}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        active={state.italic}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        active={state.underline}
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.paragraph}
        label="Paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        P
      </ToolbarButton>
      <ToolbarButton
        active={state.h1}
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        active={state.h2}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.bulletList}
        label="Bulleted list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        active={state.orderedList}
        label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>

      <div className="ml-auto text-xs text-zinc-400">
        {status === "saving" && "Saving…"}
        {status === "saved" && (
          <span className="text-emerald-500">Saved</span>
        )}
        {status === "error" && (
          <span className="text-red-500">Couldn&apos;t save</span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-700" />;
}

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-sm font-medium ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}
