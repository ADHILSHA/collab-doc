/*
  Warnings:

  - You are about to drop the `DocumentPresence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentPresence" DROP CONSTRAINT "DocumentPresence_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPresence" DROP CONSTRAINT "DocumentPresence_userId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "yjsState" BYTEA;

-- DropTable
DROP TABLE "DocumentPresence";
