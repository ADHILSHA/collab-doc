-- CreateTable
CREATE TABLE "DocumentPresence" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentPresence_documentId_userId_key" ON "DocumentPresence"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "DocumentPresence" ADD CONSTRAINT "DocumentPresence_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPresence" ADD CONSTRAINT "DocumentPresence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
