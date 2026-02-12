-- Add SELECT to enum
ALTER TYPE "DictionaryColumnType" ADD VALUE IF NOT EXISTS 'SELECT';

-- Extend dictionary columns metadata for dynamic builder
ALTER TABLE "DictionaryColumn"
  ADD COLUMN IF NOT EXISTS "displayField" TEXT,
  ADD COLUMN IF NOT EXISTS "optionsJson" TEXT,
  ADD COLUMN IF NOT EXISTS "autoGenerate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "length" INTEGER,
  ADD COLUMN IF NOT EXISTS "precision" INTEGER,
  ADD COLUMN IF NOT EXISTS "scale" INTEGER;
