/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "metadata" TEXT;
