/*
  Warnings:

  - The `transcripted_data` column on the `Interaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "transcripted_data",
ADD COLUMN     "transcripted_data" TEXT[] DEFAULT ARRAY[]::TEXT[];
