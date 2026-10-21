-- CreateEnum
CREATE TYPE "pos"."promotion_stack_policy" AS ENUM ('BEST_DEAL', 'STACK', 'EXCLUSIVE');

-- CreateTable
CREATE TABLE "pos"."promotions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "rule_json" JSONB NOT NULL,
    "stack_policy" "pos"."promotion_stack_policy" NOT NULL DEFAULT 'BEST_DEAL',
    "effective_from" TIMESTAMPTZ NOT NULL,
    "effective_to" TIMESTAMPTZ,
    "status" "pos"."active_status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."coupons" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "promotion_id" UUID,
    "max_redemptions" INTEGER,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMPTZ,
    "valid_to" TIMESTAMPTZ,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_organization_id_code_key" ON "pos"."promotions"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_organization_id_code_key" ON "pos"."coupons"("organization_id", "code");

-- AddForeignKey
ALTER TABLE "pos"."promotions" ADD CONSTRAINT "promotions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."coupons" ADD CONSTRAINT "coupons_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."coupons" ADD CONSTRAINT "coupons_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "pos"."promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
