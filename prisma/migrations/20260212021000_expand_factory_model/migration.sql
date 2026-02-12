-- AlterTable
ALTER TABLE "Factory" RENAME COLUMN "active" TO "isActive";

ALTER TABLE "Factory"
ADD COLUMN "code" TEXT,
ADD COLUMN "legalName" TEXT,
ADD COLUMN "document" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "addressLine2" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "zip" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Factory"
SET "code" = UPPER('FAC-' || SUBSTRING("id" FROM 1 FOR 8))
WHERE "code" IS NULL;

ALTER TABLE "Factory"
ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Factory_code_key" ON "Factory"("code");
CREATE INDEX "Factory_name_idx" ON "Factory"("name");
CREATE INDEX "Factory_isActive_idx" ON "Factory"("isActive");
