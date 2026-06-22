-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "modality" DROP NOT NULL,
ALTER COLUMN "modality" SET DATA TYPE "Modality";
