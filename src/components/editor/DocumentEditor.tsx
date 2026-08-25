"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Loader2,
  Wifi,
  WifiOff,
  MessageSquarePlus,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCommentDialog } from "./AddCommentDialog";
import { CommentsDialog, type CommentT } from "./CommentsDialog";

const COMMENT_FLASH_CLASS = "comment-mark-flash";
const COMMENT_FLASH_DURATION_MS = 1500;

export function DocumentEditor({
  editor,
  documentId,
  currentUserId,
  isOwner,
  connectionStatus,
}: {
  editor: Editor | null;
  documentId: string;
  currentUserId: string;
  isOwner: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected";
}) {
  const [comments, setComments] = useState<CommentT[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [focusedCommentId, setFocusedCommentId] = useState<string | null>(null);
  const [pendingQuote, setPendingQuote] = useState("");
  const pendingSelectionRef = useRef<{ from: number; to: number } | null>(
    null,
  );

  useEffect(() => {
    fetch(`/api/documents/${documentId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CommentT[]) => setComments(data))
      .catch(() => {});
  }, [documentId]);

  useEffect(() => {
    if (!editor) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("[data-comment-id]");
      const commentId = anchor?.getAttribute("data-comment-id");
      if (commentId) {
        setFocusedCommentId(commentId);
        setCommentsDialogOpen(true);
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("click", handleClick);
    return () => dom.removeEventListener("click", handleClick);
  }, [editor]);

  function flashAnchor(commentId: string) {
    const el = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add(COMMENT_FLASH_CLASS);
    setTimeout(() => el.classList.remove(COMMENT_FLASH_CLASS), COMMENT_FLASH_DURATION_MS);
  }

  function openAddCommentDialog() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const text = editor.state.doc.textBetween(from, to, " ");
    pendingSelectionRef.current = { from, to };
    setPendingQuote(text);
    setAddDialogOpen(true);
  }

  async function submitComment(body: string) {
    const selection = pendingSelectionRef.current;
    if (!selection || !editor) return;

    const res = await fetch(`/api/documents/${documentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, quotedText: pendingQuote }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    const comment = (await res.json()) as CommentT;

    setComments((prev) => [...prev, comment]);
    editor.chain().setTextSelection(selection).setComment(comment.id).run();
    setAddDialogOpen(false);
  }

  async function toggleResolved(commentId: string, resolved: boolean) {
    const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved }),
    });
    if (!res.ok) throw new Error("Failed to update comment");
    const updated = (await res.json()) as CommentT;
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
  }

  async function handleDeleteComment(commentId: string) {
    const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete comment");
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    editor?.commands.unsetComment(commentId);
  }

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
      <Toolbar
        editor={editor}
        connectionStatus={connectionStatus}
        unresolvedCount={comments.filter((c) => !c.resolved).length}
        onAddComment={openAddCommentDialog}
        onOpenComments={() => {
          setFocusedCommentId(null);
          setCommentsDialogOpen(true);
        }}
      />
      <div className="px-6 py-8 sm:px-10">
        <EditorContent editor={editor} />
      </div>

      <AddCommentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        quotedText={pendingQuote}
        onSubmit={submitComment}
      />

      <CommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        comments={comments}
        canDelete={(comment) => comment.author.id === currentUserId || isOwner}
        focusedCommentId={focusedCommentId}
        onToggleResolved={toggleResolved}
        onDelete={handleDeleteComment}
        onFocusAnchor={(commentId) => {
          setCommentsDialogOpen(false);
          setTimeout(() => flashAnchor(commentId), 150);
        }}
      />
    </div>
  );
}

function Toolbar({
  editor,
  connectionStatus,
  unresolvedCount,
  onAddComment,
  onOpenComments,
}: {
  editor: Editor;
  connectionStatus: "connecting" | "connected" | "disconnected";
  unresolvedCount: number;
  onAddComment: () => void;
  onOpenComments: () => void;
}) {
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
      hasSelection: !(ctx.editor?.state.selection.empty ?? true),
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

      <Divider />

      <ToolbarButton
        active={false}
        disabled={!state.hasSelection}
        label="Comment on selection"
        onClick={onAddComment}
      >
        <MessageSquarePlus />
      </ToolbarButton>
      <ToolbarButton active={false} label="View comments" onClick={onOpenComments}>
        <span className="relative">
          <MessageSquare />
          {unresolvedCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
              {unresolvedCount > 9 ? "9+" : unresolvedCount}
            </span>
          )}
        </span>
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1.5 pr-1 text-xs text-muted-foreground">
        {connectionStatus === "connecting" && (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Connecting…
          </>
        )}
        {connectionStatus === "connected" && (
          <span className="flex items-center gap-1 text-success">
            <Wifi className="size-3.5" />
            Live
          </span>
        )}
        {connectionStatus === "disconnected" && (
          <span className="flex items-center gap-1 text-error">
            <WifiOff className="size-3.5" />
            Offline
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
  disabled,
  label,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
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
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-ring flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors [&_svg]:size-4",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-accent-muted text-accent"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
