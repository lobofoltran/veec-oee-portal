-- CreateEnum
CREATE TYPE "DictionaryColumnType" AS ENUM ('STRING', 'TEXT', 'INT', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME', 'UUID', 'FK');

-- CreateEnum
CREATE TYPE "MenuAccessRole" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR', 'USER');

-- AlterTable
ALTER TABLE "Factory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DictionaryTable" (
    "id" TEXT NOT NULL,
    "schema" TEXT NOT NULL DEFAULT 'public',
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryColumn" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "DictionaryColumnType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "unique" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "isPrimaryKey" BOOLEAN NOT NULL DEFAULT false,
    "fkTableId" TEXT,
    "fkColumnName" TEXT DEFAULT 'id',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "href" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuRole" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "role" "MenuAccessRole" NOT NULL,

    CONSTRAINT "MenuRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryTable_schema_name_key" ON "DictionaryTable"("schema", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryColumn_tableId_name_key" ON "DictionaryColumn"("tableId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_parentId_order_key" ON "Menu"("parentId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MenuRole_menuId_role_key" ON "MenuRole"("menuId", "role");

-- AddForeignKey
ALTER TABLE "DictionaryColumn" ADD CONSTRAINT "DictionaryColumn_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DictionaryTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionaryColumn" ADD CONSTRAINT "DictionaryColumn_fkTableId_fkey" FOREIGN KEY ("fkTableId") REFERENCES "DictionaryTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuRole" ADD CONSTRAINT "MenuRole_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
