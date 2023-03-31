-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "businessUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessUserId_fkey" FOREIGN KEY ("businessUserId") REFERENCES "Business"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
