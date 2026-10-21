-- CreateEnum
CREATE TYPE "pos"."store_concept" AS ENUM ('FULL_PRICE', 'OUTLET', 'MULTI_BRAND', 'OTHER');

-- CreateEnum
CREATE TYPE "pos"."store_status" AS ENUM ('PLANNED', 'LIVE', 'SUSPENDED', 'CLOSED');

-- CreateTable
CREATE TABLE "pos"."stores" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "concept" "pos"."store_concept" NOT NULL DEFAULT 'FULL_PRICE',
    "timezone" TEXT NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "language_code" TEXT NOT NULL,
    "tax_jurisdiction_code" TEXT,
    "address_line1" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "pos"."store_status" NOT NULL DEFAULT 'PLANNED',
    "external_sap_site" TEXT,
    "external_fluent_location" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stores_country_id_idx" ON "pos"."stores"("country_id");

-- CreateIndex
CREATE INDEX "stores_brand_id_idx" ON "pos"."stores"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_organization_id_code_key" ON "pos"."stores"("organization_id", "code");

-- AddForeignKey
ALTER TABLE "pos"."stores" ADD CONSTRAINT "stores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."stores" ADD CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "pos"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."stores" ADD CONSTRAINT "stores_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "pos"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."stores" ADD CONSTRAINT "stores_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "pos"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."stores" ADD CONSTRAINT "stores_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "pos"."languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
