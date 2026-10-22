-- CreateEnum
CREATE TYPE "repo_index_status" AS ENUM ('idle', 'indexing', 'indexed', 'failed');

-- CreateEnum
CREATE TYPE "chat_role" AS ENUM ('user', 'assistant');

-- AlterEnum
ALTER TYPE "auth_type" ADD VALUE 'github';

-- AlterTable
ALTER TABLE "playground" ADD COLUMN     "github_branch" TEXT,
ADD COLUMN     "github_repo" TEXT;

-- CreateTable
CREATE TABLE "github_repository" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "github_id" BIGINT NOT NULL,
    "full_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "default_branch" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "pushed_at" TIMESTAMP(3),
    "index_status" "repo_index_status" NOT NULL DEFAULT 'idle',
    "indexed_at" TIMESTAMP(3),
    "file_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repo_chat_message" (
    "id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "role" "chat_role" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repo_chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "github_repository_user_id_idx" ON "github_repository"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_user_id_github_id_key" ON "github_repository"("user_id", "github_id");

-- CreateIndex
CREATE INDEX "repo_chat_message_repository_id_created_at_idx" ON "repo_chat_message"("repository_id", "created_at");

-- AddForeignKey
ALTER TABLE "github_repository" ADD CONSTRAINT "github_repository_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repo_chat_message" ADD CONSTRAINT "repo_chat_message_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "github_repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
