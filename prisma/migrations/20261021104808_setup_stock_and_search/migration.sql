-- CreateTable
CREATE TABLE "pos"."stock_positions" (
    "store_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "on_hand" DECIMAL(12,3),
    "available_to_sell" DECIMAL(12,3),
    "reserved" DECIMAL(12,3),
    "source_system" TEXT NOT NULL,
    "as_of" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_positions_pkey" PRIMARY KEY ("store_id","sku")
);

-- CreateIndex
CREATE INDEX "stock_positions_sku_idx" ON "pos"."stock_positions"("sku");

-- AddForeignKey
ALTER TABLE "pos"."stock_positions" ADD CONSTRAINT "stock_positions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "pos"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
