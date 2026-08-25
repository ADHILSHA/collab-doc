import "dotenv/config";
import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { getSchema } from "@tiptap/core";
import {
  prosemirrorJSONToYDoc,
  yXmlFragmentToProseMirrorRootNode,
} from "y-prosemirror";
import { prisma } from "../src/lib/prisma";
import { getDocumentWithAccess } from "../src/lib/documents";
import { getSharedExtensions } from "../src/lib/editor-extensions";

// Must match the `field` TipTap's Collaboration extension is configured
// with on the client (defaults to "default").
const YJS_FIELD = "default";

const schema = getSchema(getSharedExtensions());
const port = Number(process.env.COLLAB_SERVER_PORT ?? 1234);

const server = new Server({
  port,

  async onAuthenticate({ token, documentName }) {
    if (!token) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: token } });
    if (!user) throw new Error("Unauthorized");

    const { doc, access } = await getDocumentWithAccess(documentName, user.id);
    if (!doc || !access) throw new Error("Forbidden");

    return { user };
  },

  async onLoadDocument({ documentName, document }) {
    const doc = await prisma.document.findUnique({ where: { id: documentName } });
    if (!doc) return document;

    if (doc.yjsState) {
      Y.applyUpdate(document, new Uint8Array(doc.yjsState));
      return document;
    }

    // First time this document is opened under collaborative editing:
    // seed the Yjs doc from whatever JSON content it already has (either
    // from the plain editor, a file upload, or the schema default).
    const seeded = prosemirrorJSONToYDoc(schema, doc.content, YJS_FIELD);
    Y.applyUpdate(document, Y.encodeStateAsUpdate(seeded));
    return document;
  },

  async onStoreDocument({ documentName, document }) {
    const update = Y.encodeStateAsUpdate(document);
    const rootNode = yXmlFragmentToProseMirrorRootNode(
      document.getXmlFragment(YJS_FIELD),
      schema,
    );

    await prisma.document.update({
      where: { id: documentName },
      data: {
        yjsState: Buffer.from(update),
        content: rootNode.toJSON(),
      },
    });
  },
});

server.listen().then(() => {
  console.log(`Collab server listening on ws://localhost:${port}`);
});
