-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "aisle" TEXT,
ADD COLUMN     "defaultUnitId" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "abbreviation" TEXT,
ADD COLUMN     "kind" TEXT;

-- AlterTable
ALTER TABLE "Utensil" ADD COLUMN     "image" TEXT,
ADD COLUMN     "imagePublicId" TEXT;

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Ingredient_defaultUnitId_idx" ON "Ingredient"("defaultUnitId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
