-- AlterEnum: remove 'google' (Google sign-in was removed; no users had it).
BEGIN;
CREATE TYPE "auth_type_new" AS ENUM ('email', 'github');
ALTER TABLE "user" ALTER COLUMN "auth_type" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "auth_type" TYPE "auth_type_new" USING ("auth_type"::text::"auth_type_new");
ALTER TYPE "auth_type" RENAME TO "auth_type_old";
ALTER TYPE "auth_type_new" RENAME TO "auth_type";
DROP TYPE "public"."auth_type_old";
ALTER TABLE "user" ALTER COLUMN "auth_type" SET DEFAULT 'email';
COMMIT;
