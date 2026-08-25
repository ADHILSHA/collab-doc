import { marked } from "marked";
import { generateJSON } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { JSDOM } from "jsdom";

let domReady = false;

function ensureServerDom() {
  if (domReady) return;
  const { window } = new JSDOM("");
  const g = globalThis as unknown as {
    window: unknown;
    document: unknown;
    DOMParser: unknown;
    Node: unknown;
  };
  g.window = window;
  g.document = window.document;
  g.DOMParser = window.DOMParser;
  g.Node = window.Node;
  domReady = true;
}

export function markdownToTiptapJSON(markdown: string) {
  ensureServerDom();
  const html = marked.parse(markdown, { async: false, gfm: true });
  return generateJSON(html, [StarterKit]);
}

export function plainTextToTiptapJSON(text: string) {
  const lines = text.split(/\r?\n/);
  const content = lines.map((line) =>
    line.length > 0
      ? { type: "paragraph", content: [{ type: "text", text: line }] }
      : { type: "paragraph" },
  );

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}
