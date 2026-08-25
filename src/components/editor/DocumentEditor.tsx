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
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!editor) {
    return (
      <div className="animate-pulse space-y-3 rounded-lg border border-border bg-surface p-6">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
      <Toolbar editor={editor} status={status} />
      <div className="px-6 py-8 sm:px-10">
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
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-surface/95 px-2.5 py-2 backdrop-blur">
      <ToolbarButton
        active={state.bold}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        active={state.italic}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        active={state.underline}
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.paragraph}
        label="Paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow />
      </ToolbarButton>
      <ToolbarButton
        active={state.h1}
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 />
      </ToolbarButton>
      <ToolbarButton
        active={state.h2}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={state.bulletList}
        label="Bulleted list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        active={state.orderedList}
        label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1.5 pr-1 text-xs text-muted-foreground">
        {status === "saving" && (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Saving…
          </>
        )}
        {status === "saved" && (
          <span className="flex items-center gap-1 text-success">
            <Check className="size-3.5" />
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1 text-error">
            <AlertCircle className="size-3.5" />
            Couldn&apos;t save
          </span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
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
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "focus-ring flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors [&_svg]:size-4",
        active
          ? "bg-accent-muted text-accent"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
