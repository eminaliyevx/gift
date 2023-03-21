/*
  Warnings:

  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `UserImage` table. All the data in the column will be lost.
  - Added the required column `filename` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `UserImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `UserImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "url",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserImage" DROP COLUMN "url",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
