import StarterKit from "@tiptap/starter-kit";
import { CommentMark } from "@/components/editor/CommentMark";

/**
 * Shared between the client editor and the standalone collab server so both
 * build the exact same ProseMirror schema. History is disabled because Yjs's
 * UndoManager (via the Collaboration extension) replaces it.
 */
export function getSharedExtensions() {
  return [StarterKit.configure({ undoRedo: false }), CommentMark];
}
