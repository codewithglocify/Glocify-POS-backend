/*
  Warnings:

  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `valid_till` on the `user_assignments` table. All the data in the column will be lost.
  - Added the required column `permission_code` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `user_assignments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `scope_type` on the `user_assignments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "pos"."auth_surface" AS ENUM ('POS', 'ADMIN');

-- CreateEnum
CREATE TYPE "pos"."assignment_scope_type" AS ENUM ('ORGANIZATION', 'BRAND', 'REGION', 'COUNTRY', 'STORE');

-- AlterEnum
ALTER TYPE "pos"."app_user_status" ADD VALUE 'INVITED';

-- DropForeignKey
ALTER TABLE "pos"."role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "pos"."role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropIndex
DROP INDEX "pos"."product_translations_name_trgm_idx";

-- DropIndex
DROP INDEX "pos"."product_variants_sku_trgm_idx";

-- DropIndex
DROP INDEX "pos"."products_name_trgm_idx";

-- DropIndex
DROP INDEX "pos"."role_permissions_roleId_permissionId_key";

-- AlterTable
ALTER TABLE "pos"."app_users" ADD COLUMN     "invite_expires_at" TIMESTAMPTZ,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "pin_length" SMALLINT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'INVITED',
ALTER COLUMN "pin_hash" DROP NOT NULL,
ALTER COLUMN "pin_set_at" DROP NOT NULL,
ALTER COLUMN "pin_set_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "pos"."permissions" DROP CONSTRAINT "permissions_pkey",
DROP COLUMN "id",
ADD COLUMN     "allowed_scope_types" "pos"."assignment_scope_type"[],
ADD COLUMN     "surfaces" "pos"."auth_surface"[],
ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "pos"."role_permissions" DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "permission_code" TEXT NOT NULL,
ADD COLUMN     "role_id" UUID NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_code");

-- AlterTable
ALTER TABLE "pos"."roles" ADD COLUMN     "allowed_assignment_scopes" "pos"."assignment_scope_type"[];

-- AlterTable
ALTER TABLE "pos"."user_assignments" DROP COLUMN "updated_at",
DROP COLUMN "valid_till",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "valid_to" TIMESTAMPTZ,
DROP COLUMN "scope_type",
ADD COLUMN     "scope_type" "pos"."assignment_scope_type" NOT NULL;

-- CreateIndex
CREATE INDEX "user_assignments_user_id_idx" ON "pos"."user_assignments"("user_id");

-- AddForeignKey
ALTER TABLE "pos"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "pos"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."role_permissions" ADD CONSTRAINT "role_permissions_permission_code_fkey" FOREIGN KEY ("permission_code") REFERENCES "pos"."permissions"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
