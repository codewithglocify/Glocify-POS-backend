-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pos";

-- CreateEnum
CREATE TYPE "pos"."active_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "pos"."data_plane" AS ENUM ('NAM', 'EMEA', 'APAC');

-- CreateEnum
CREATE TYPE "pos"."tax_model" AS ENUM ('VAT', 'GST', 'SALES_TAX', 'CONSUMPTION_TAX', 'COMMERCIAL_TAX', 'NONE');

-- CreateEnum
CREATE TYPE "pos"."price_tax_mode" AS ENUM ('INCLUSIVE', 'EXCLUSIVE');

-- CreateTable
CREATE TABLE "pos"."currencies" (
    "code" CHAR(3) NOT NULL,
    "numeric_code" CHAR(3) NOT NULL,
    "minor_units" SMALLINT NOT NULL,
    "cash_rounding_increment" DECIMAL(19,4),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "pos"."languages" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_rtl" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "pos"."regions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data_plane" "pos"."data_plane" NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."countries" (
    "id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "iso_code" CHAR(2) NOT NULL,
    "name" TEXT NOT NULL,
    "default_currency" CHAR(3) NOT NULL,
    "default_language" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "tax_model" "pos"."tax_model" NOT NULL,
    "price_tax_mode" "pos"."price_tax_mode" NOT NULL,
    "fiscal_regime" TEXT NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."organizations" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "status" "pos"."active_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."brands" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "pos"."active_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."organization_regions" (
    "organization_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,

    CONSTRAINT "organization_regions_pkey" PRIMARY KEY ("organization_id","region_id")
);

-- CreateTable
CREATE TABLE "pos"."organization_countries" (
    "organization_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,

    CONSTRAINT "organization_countries_pkey" PRIMARY KEY ("organization_id","country_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "pos"."regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "pos"."countries"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_id_region_id_key" ON "pos"."countries"("id", "region_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "pos"."organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "brands_organization_id_code_key" ON "pos"."brands"("organization_id", "code");

-- AddForeignKey
ALTER TABLE "pos"."countries" ADD CONSTRAINT "countries_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "pos"."regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."countries" ADD CONSTRAINT "countries_default_currency_fkey" FOREIGN KEY ("default_currency") REFERENCES "pos"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."countries" ADD CONSTRAINT "countries_default_language_fkey" FOREIGN KEY ("default_language") REFERENCES "pos"."languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."brands" ADD CONSTRAINT "brands_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_regions" ADD CONSTRAINT "organization_regions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_regions" ADD CONSTRAINT "organization_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "pos"."regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_countries" ADD CONSTRAINT "organization_countries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_countries" ADD CONSTRAINT "organization_countries_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "pos"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_countries" ADD CONSTRAINT "organization_countries_country_id_region_id_fkey" FOREIGN KEY ("country_id", "region_id") REFERENCES "pos"."countries"("id", "region_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."organization_countries" ADD CONSTRAINT "organization_countries_organization_id_region_id_fkey" FOREIGN KEY ("organization_id", "region_id") REFERENCES "pos"."organization_regions"("organization_id", "region_id") ON DELETE RESTRICT ON UPDATE CASCADE;

