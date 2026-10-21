-- CreateTable
CREATE TABLE "pos"."categories" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."products" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "sap_article" TEXT NOT NULL,
    "style_number" TEXT,
    "name" TEXT NOT NULL,
    "tax_class_code" TEXT NOT NULL,
    "status" "pos"."active_status" NOT NULL DEFAULT 'ACTIVE',
    "source_updated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "status" "pos"."active_status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."barcodes" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "symbology" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."product_translations" (
    "variant_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("variant_id","language_code")
);

-- CreateTable
CREATE TABLE "pos"."product_categories" (
    "variant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("variant_id","category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_organization_id_code_key" ON "pos"."categories"("organization_id", "code");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "pos"."products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_organization_id_sap_article_key" ON "pos"."products"("organization_id", "sap_article");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "pos"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "pos"."product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "pos"."product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "barcodes_organization_id_value_key" ON "pos"."barcodes"("organization_id", "value");

-- CreateIndex
CREATE INDEX "product_translations_name_idx" ON "pos"."product_translations"("name");

-- AddForeignKey
ALTER TABLE "pos"."categories" ADD CONSTRAINT "categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pos"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "pos"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."barcodes" ADD CONSTRAINT "barcodes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."barcodes" ADD CONSTRAINT "barcodes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "pos"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."product_translations" ADD CONSTRAINT "product_translations_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "pos"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."product_translations" ADD CONSTRAINT "product_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "pos"."languages"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."product_categories" ADD CONSTRAINT "product_categories_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "pos"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "pos"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
