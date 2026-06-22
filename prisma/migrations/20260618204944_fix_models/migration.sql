/*
  Warnings:

  - You are about to drop the column `salary` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `technologies` on the `posts` table. All the data in the column will be lost.
  - The primary key for the `user_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `department` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `experience_years` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `modality` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `salary_max` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `salary_min` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `score_notification` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `seniority` on the `user_profiles` table. All the data in the column will be lost.
  - The required column `id` was added to the `user_profiles` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "salary",
DROP COLUMN "technologies",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "salaryMax" DOUBLE PRECISION,
ADD COLUMN     "salaryMin" DOUBLE PRECISION,
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_pkey",
DROP COLUMN "department",
DROP COLUMN "experience_years",
DROP COLUMN "location",
DROP COLUMN "modality",
DROP COLUMN "salary_max",
DROP COLUMN "salary_min",
DROP COLUMN "score_notification",
DROP COLUMN "seniority",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" TEXT,
ADD COLUMN     "experience_years" INTEGER DEFAULT 0,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "modality" "Modality"[],
ADD COLUMN     "salary_max" DOUBLE PRECISION,
ADD COLUMN     "salary_min" DOUBLE PRECISION,
ADD COLUMN     "score_notification" INTEGER,
ADD COLUMN     "seniority" "Seniority";
