CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON "pos"."products" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_variants_sku_trgm_idx
  ON "pos"."product_variants" USING GIN ("sku" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_translations_name_trgm_idx
  ON "pos"."product_translations" USING GIN ("name" gin_trgm_ops);
