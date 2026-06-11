-- CreateEnum
CREATE TYPE "SeasonMode" AS ENUM ('AUTO', 'MANUAL', 'ALWAYS');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "seasonMode" "SeasonMode" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "seasonMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;
