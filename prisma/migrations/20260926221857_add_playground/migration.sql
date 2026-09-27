-- CreateEnum
CREATE TYPE "playground_template" AS ENUM ('react', 'nextjs', 'vue', 'angular', 'express', 'hono');

-- CreateTable
CREATE TABLE "playground" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "template" "playground_template" NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playground_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playground_user_id_idx" ON "playground"("user_id");

-- AddForeignKey
ALTER TABLE "playground" ADD CONSTRAINT "playground_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
