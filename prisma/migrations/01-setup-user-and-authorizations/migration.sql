-- CreateEnum
CREATE TYPE "pos"."app_user_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'LEFT');

-- CreateEnum
CREATE TYPE "pos"."scope_type" AS ENUM ('ORGANIZATION', 'BRAND', 'REGION', 'COUNTRY', 'STORE', 'TERMINAL');

-- CreateTable
CREATE TABLE "pos"."roles" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."app_users" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "external_subject" TEXT NOT NULL,
    "employee_number" TEXT,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "pos"."app_user_status" NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "pin_set_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos"."role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "pos"."user_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope_type" "pos"."scope_type" NOT NULL,
    "scope_id" UUID NOT NULL,
    "valid_from" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_till" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_organization_id_code_key" ON "pos"."roles"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_organization_id_external_subject_key" ON "pos"."app_users"("organization_id", "external_subject");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "pos"."role_permissions"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "pos"."roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."app_users" ADD CONSTRAINT "app_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "pos"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "pos"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "pos"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."user_assignments" ADD CONSTRAINT "user_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pos"."app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos"."user_assignments" ADD CONSTRAINT "user_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "pos"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

