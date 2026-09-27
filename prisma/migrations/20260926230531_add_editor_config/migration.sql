-- CreateTable
CREATE TABLE "editor_config" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL DEFAULT 'vs-dark-plus',
    "font_id" TEXT NOT NULL DEFAULT 'jetbrains-mono',
    "font_size" INTEGER NOT NULL DEFAULT 14,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editor_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "editor_config_user_id_key" ON "editor_config"("user_id");

-- AddForeignKey
ALTER TABLE "editor_config" ADD CONSTRAINT "editor_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
