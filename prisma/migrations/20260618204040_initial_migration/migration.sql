-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('junior', 'mid', 'senior');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('remote', 'hybrid', 'onsite');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "score_alert" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "lastname" TEXT,
    "skills" TEXT[],
    "roles" TEXT[],
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "seniority" "Seniority",
    "location" TEXT,
    "department" TEXT,
    "modality" "Modality"[],
    "score_notification" INTEGER,
    "salary_min" DOUBLE PRECISION,
    "salary_max" DOUBLE PRECISION,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "is_job" BOOLEAN NOT NULL,
    "position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "modality" "Modality"[],
    "seniority" "Seniority",
    "salary" DOUBLE PRECISION,
    "technologies" TEXT[],
    "benefits" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "posts_external_id_key" ON "posts"("external_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
