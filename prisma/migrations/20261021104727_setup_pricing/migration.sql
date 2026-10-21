-- CreateTable
CREATE TABLE "pos"."price_lists" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "brand_id" UUID,
    "country_id" UUID,
    "concept" TEXT,
    "source_system" TEXT NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."price_list_items" (
    "id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "unit_price" DECIMAL(19,4) NOT NULL,
    "compare_at_price" DECIMAL(19,4),
    "effective_from" TIMESTAMPTZ NOT NULL,
    "effective_to" TIMESTAMPTZ,
    "source_document" TEXT,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."store_price_lists" (
    "store_id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "store_price_lists_pkey" PRIMARY KEY ("store_id","price_list_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_organization_id_code_key" ON "pos"."price_lists"("organization_id", "code");

-- CreateIndex
CREATE INDEX "price_list_items_price_list_id_variant_id_effective_from_idx" ON "pos"."price_list_items"("price_list_id", "variant_id", "effective_from" DESC);

-- AddForeignKey
ALTER TABLE "pos"."price_lists" ADD CONSTRAINT "price_lists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."price_lists" ADD CONSTRAINT "price_lists_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "pos"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."price_lists" ADD CONSTRAINT "price_lists_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "pos"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."price_lists" ADD CONSTRAINT "price_lists_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "pos"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "pos"."price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."price_list_items" ADD CONSTRAINT "price_list_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "pos"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."store_price_lists" ADD CONSTRAINT "store_price_lists_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "pos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."store_price_lists" ADD CONSTRAINT "store_price_lists_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "pos"."price_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
