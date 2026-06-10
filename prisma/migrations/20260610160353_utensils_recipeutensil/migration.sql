-- CreateTable
CREATE TABLE "Utensil" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Utensil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeUtensil" (
    "recipeId" TEXT NOT NULL,
    "utensilId" TEXT NOT NULL,
    "quantity" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecipeUtensil_pkey" PRIMARY KEY ("recipeId","utensilId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utensil_name_key" ON "Utensil"("name");

-- CreateIndex
CREATE INDEX "RecipeUtensil_utensilId_idx" ON "RecipeUtensil"("utensilId");

-- AddForeignKey
ALTER TABLE "RecipeUtensil" ADD CONSTRAINT "RecipeUtensil_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeUtensil" ADD CONSTRAINT "RecipeUtensil_utensilId_fkey" FOREIGN KEY ("utensilId") REFERENCES "Utensil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
