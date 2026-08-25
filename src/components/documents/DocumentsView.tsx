"use client";

import { useMemo, useState } from "react";
import { Search, FileText, Users } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewDocumentButton } from "./NewDocumentButton";
import { UploadDocumentButton } from "./UploadDocumentButton";
import { DocumentRow } from "./DocumentRow";
import { RecentCard } from "./RecentCard";

type OwnedDoc = { id: string; title: string; updatedAtLabel: string; updatedAt: string };
type SharedDoc = OwnedDoc & { owner: { name: string; colorHex: string } };

export function DocumentsView({
  owned,
  shared,
}: {
  owned: OwnedDoc[];
  shared: SharedDoc[];
}) {
  const [query, setQuery] = useState("");

  const recent = useMemo(() => {
    return [...owned, ...shared]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [owned, shared]);

  const q = query.trim().toLowerCase();
  const filteredOwned = q ? owned.filter((d) => d.title.toLowerCase().includes(q)) : owned;
  const filteredShared = q ? shared.filter((d) => d.title.toLowerCase().includes(q)) : shared;
  const isSearching = q.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
      </div>

      {!isSearching && recent.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recent.map((doc) => (
              <RecentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}

      <section id="my-documents" className="mb-10 scroll-mt-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">My Documents</h2>
          <div className="flex items-center gap-2">
            <UploadDocumentButton />
            <NewDocumentButton />
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Upload creates a new document from a .txt or .md file. Other file types
          aren&apos;t supported.
        </p>
        {filteredOwned.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={isSearching ? "No matching documents" : "No documents yet"}
            description={
              isSearching
                ? "Try a different search term."
                : "Create a new document or upload a .txt/.md file to get started."
            }
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface shadow-xs">
            {filteredOwned.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} canDelete />
            ))}
          </ul>
        )}
      </section>

      <section id="shared" className="scroll-mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Shared with Me</h2>
        {filteredShared.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isSearching ? "No matching documents" : "Nothing shared with you yet"}
            description={
              isSearching
                ? "Try a different search term."
                : "Documents other people share with you will show up here."
            }
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface shadow-xs">
            {filteredShared.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} canDelete={false} ownerLabel={doc.owner.name} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
