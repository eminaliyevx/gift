/*
  Warnings:

  - You are about to drop the column `filename` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `UserImage` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `UserImage` table. All the data in the column will be lost.
  - Added the required column `key` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `UserImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `UserImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "filename",
DROP COLUMN "path",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserImage" DROP COLUMN "filename",
DROP COLUMN "path",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
