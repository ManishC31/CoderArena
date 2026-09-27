-- CreateTable
CREATE TABLE "playground_file" (
    "id" TEXT NOT NULL,
    "playground_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playground_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playground_file_playground_id_path_key" ON "playground_file"("playground_id", "path");

-- AddForeignKey
ALTER TABLE "playground_file" ADD CONSTRAINT "playground_file_playground_id_fkey" FOREIGN KEY ("playground_id") REFERENCES "playground"("id") ON DELETE CASCADE ON UPDATE CASCADE;
