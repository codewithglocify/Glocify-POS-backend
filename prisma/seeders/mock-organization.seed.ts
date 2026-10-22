import { PasswordHasher } from '@nestjs/authentication';
import {
  ActiveStatus,
  AppUserStatus,
  PrismaClient,
  ScopeType,
  StoreConcept,
  StoreStatus,
  type Organization,
  type Store,
} from '../../dist/generated/prisma/client.js';
import { SUPER_ADMIN_ROLE_CODE, SUPER_ADMIN_ROLE_NAME } from '../../dist/constants/roles.constants.js';

const MOCK_ADMIN_EMAIL = 'johndoe@mock.com';
const MOCK_STORE_ADMIN_EMAIL = 'store.admin@mock.com';
const STORE_ADMIN_ROLE_CODE = 'STORE_ADMIN';
const STORE_ADMIN_ROLE_NAME = 'Store Admin';
const STORE_ADMIN_PERMISSION_CODE = 'Store Admin';

const MOCK_PRODUCTS = [
  {
    sapArticle: 'MOCK-TEE-001',
    styleNumber: 'TEE001',
    name: 'Mock Tee',
    sku: 'MOCK-TEE-001-BLK-M',
    color: 'BLK',
    size: 'M',
    barcode: '8901000000001',
    unitPrice: '999.0000',
  },
  {
    sapArticle: 'MOCK-BAG-001',
    styleNumber: 'BAG001',
    name: 'Mock Tote',
    sku: 'MOCK-BAG-001-NVY',
    color: 'NVY',
    size: null,
    barcode: '8901000000002',
    unitPrice: '1499.0000',
  },
  {
    sapArticle: 'MOCK-CAP-001',
    styleNumber: 'CAP001',
    name: 'Mock Cap',
    sku: 'MOCK-CAP-001-RED',
    color: 'RED',
    size: null,
    barcode: '8901000000003',
    unitPrice: '499.0000',
  },
] as const;

export default async function (prisma: PrismaClient) {
  const passwordHasher = new PasswordHasher();

  const region = await prisma.region.findFirst({ where: { code: 'APAC' } });
  const country = await prisma.country.findFirst({ where: { isoCode: 'IN' } });
  if (!region || !country) {
    throw new Error('APAC region and/or India (IN) country missing. Run default region/country seeders first.');
  }

  let organization = await prisma.organization.findFirst({
    where: { createdBy: 'Mock Seeder' },
  });
  if (organization) {
    console.info(`Mock organization already exists (code ${organization.code}).`);
  } else {
    const orgUuid = crypto.randomUUID();
    organization = await prisma.organization.create({
      data: {
        legalName: `Mock Organization - ${orgUuid}`,
        code: orgUuid,
        createdBy: 'Mock Seeder',
        updatedBy: 'Mock Seeder',
      },
    });
    console.info(`Created mock organization (code ${organization.code}).`);
  }

  await ensureOrganizationRegion(prisma, organization.id, region.id);
  await ensureOrganizationCountry(prisma, organization.id, country.id, country.regionId);

  const superAdminRole = await ensureSuperAdminRole(prisma, organization.id);
  await ensureMockAdminUser(prisma, organization, superAdminRole.id, passwordHasher);

  const brand = await ensureBrand(prisma, organization.id);

  const store = await ensureStore(prisma, organization.id, brand.id, country);

  await ensureCatalogue(prisma, organization.id, brand.id, country.id, store);

  await ensureStoreAdmin(prisma, organization, store, passwordHasher);

  console.info(
    `Mock organization ready: ${organization.code}; store ${store.code}; admin ${MOCK_ADMIN_EMAIL}; store admin ${MOCK_STORE_ADMIN_EMAIL}.`,
  );
}

async function ensureOrganizationRegion(prisma: PrismaClient, organizationId: string, regionId: string) {
  const existing = await prisma.organizationRegion.findUnique({
    where: { organizationId_regionId: { organizationId, regionId } },
  });
  if (existing) {
    console.info('Organization region APAC already attached.');
    return;
  }
  await prisma.organizationRegion.create({
    data: { organizationId, regionId },
  });
  console.info('Attached organization region APAC.');
}

async function ensureOrganizationCountry(
  prisma: PrismaClient,
  organizationId: string,
  countryId: string,
  regionId: string,
) {
  const existing = await prisma.organizationCountry.findUnique({
    where: { organizationId_countryId: { organizationId, countryId } },
  });
  if (existing) {
    console.info('Organization country IN already attached.');
    return;
  }
  await prisma.organizationCountry.create({
    data: { organizationId, countryId, regionId },
  });
  console.info('Attached organization country IN.');
}

async function ensureSuperAdminRole(prisma: PrismaClient, organizationId: string) {
  let role = await prisma.role.findUnique({
    where: { organizationId_code: { organizationId, code: SUPER_ADMIN_ROLE_CODE } },
  });
  if (role) {
    console.info(`Role ${SUPER_ADMIN_ROLE_CODE} already exists.`);
  } else {
    role = await prisma.role.create({
      data: {
        organizationId,
        code: SUPER_ADMIN_ROLE_CODE,
        name: SUPER_ADMIN_ROLE_NAME,
        description: 'Full access for the organization owner',
      },
    });
    console.info(`Created role ${SUPER_ADMIN_ROLE_CODE}.`);
  }

  const permissions = await prisma.permission.findMany({ select: { id: true } });
  if (permissions.length === 0) {
    console.warn('No permissions found; run default permission seeder. SUPER_ADMIN has no permissions attached.');
    return role;
  }

  const existingLinks = await prisma.rolePermission.findMany({
    where: { roleId: role.id },
    select: { permissionId: true },
  });
  const linked = new Set(existingLinks.map((row) => row.permissionId));
  const missing = permissions.filter((permission) => !linked.has(permission.id));
  if (missing.length === 0) {
    console.info(`Role ${SUPER_ADMIN_ROLE_CODE} already has all permissions.`);
  } else {
    await prisma.rolePermission.createMany({
      data: missing.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
      skipDuplicates: true,
    });
    console.info(`Attached ${missing.length} permission(s) to ${SUPER_ADMIN_ROLE_CODE}.`);
  }

  return role;
}

async function ensureMockAdminUser(
  prisma: PrismaClient,
  organization: Organization,
  roleId: string,
  passwordHasher: PasswordHasher,
) {
  let user = await prisma.appUser.findFirst({
    where: { organizationId: organization.id, email: MOCK_ADMIN_EMAIL },
  });
  if (user) {
    console.info(`Super admin ${MOCK_ADMIN_EMAIL} already exists.`);
  } else {
    user = await prisma.appUser.create({
      data: {
        displayName: 'Mock Admin',
        externalSubject: 'Mock Seeder',
        email: MOCK_ADMIN_EMAIL,
        pinHash: await passwordHasher.hash('mock@123'),
        pinSetAt: new Date(),
        status: AppUserStatus.ACTIVE,
        employeeNumber: 'MOCK0000001',
        organizationId: organization.id,
      },
    });
    console.info(`Created super admin ${MOCK_ADMIN_EMAIL}.`);
  }

  const assignment = await prisma.userAssignment.findFirst({
    where: {
      userId: user.id,
      roleId,
      scopeType: ScopeType.ORGANIZATION,
      scopeId: organization.id,
    },
  });
  if (assignment) {
    console.info('Super admin ORGANIZATION assignment already exists.');
  } else {
    await prisma.userAssignment.create({
      data: {
        userId: user.id,
        roleId,
        scopeType: ScopeType.ORGANIZATION,
        scopeId: organization.id,
      },
    });
    console.info('Created super admin ORGANIZATION assignment.');
  }
}

async function ensureBrand(prisma: PrismaClient, organizationId: string) {
  const existing = await prisma.brand.findUnique({
    where: { organizationId_code: { organizationId, code: 'MOCK' } },
  });
  if (existing) {
    console.info('Brand MOCK already exists.');
    return existing;
  }
  const brand = await prisma.brand.create({
    data: {
      organizationId,
      code: 'MOCK',
      name: 'Mock Brand',
      status: ActiveStatus.ACTIVE,
      createdBy: 'Mock Seeder',
      updatedBy: 'Mock Seeder',
    },
  });
  console.info('Created brand MOCK.');
  return brand;
}

async function ensureStore(
  prisma: PrismaClient,
  organizationId: string,
  brandId: string,
  country: { id: string; timezone: string; defaultCurrencyCode: string; defaultLanguageCode: string },
): Promise<Store> {
  const existing = await prisma.store.findFirst({
    where: { organizationId, code: 'IN-BOM-01' },
  });
  if (existing) {
    console.info('Store IN-BOM-01 already exists.');
    return existing;
  }
  const store = await prisma.store.create({
    data: {
      organizationId,
      brandId,
      countryId: country.id,
      code: 'IN-BOM-01',
      name: 'Mock Mumbai Store',
      concept: StoreConcept.FULL_PRICE,
      timezone: country.timezone,
      currencyCode: country.defaultCurrencyCode,
      languageCode: country.defaultLanguageCode,
      status: StoreStatus.LIVE,
      city: 'Mumbai',
      addressLine1: 'Mock High Street',
      createdBy: 'Mock Seeder',
      updatedBy: 'Mock Seeder',
    },
  });
  console.info('Created store IN-BOM-01.');
  return store;
}

async function ensureCatalogue(
  prisma: PrismaClient,
  organizationId: string,
  brandId: string,
  countryId: string,
  store: Store,
) {
  const existingCategory = await prisma.category.findUnique({
    where: { organizationId_code: { organizationId, code: 'MOCK' } },
  });
  if (existingCategory) {
    console.info('Category MOCK already exists.');
  } else {
    await prisma.category.create({
      data: {
        organizationId,
        code: 'MOCK',
        name: 'Mock Category',
      },
    });
    console.info('Created category MOCK.');
  }

  let priceList = await prisma.priceList.findUnique({
    where: { organizationId_code: { organizationId, code: 'IN-FP-INR' } },
  });
  if (priceList) {
    console.info('Price list IN-FP-INR already exists.');
  } else {
    priceList = await prisma.priceList.create({
      data: {
        organizationId,
        code: 'IN-FP-INR',
        currencyCode: 'INR',
        brandId,
        countryId,
        concept: 'FULL_PRICE',
        sourceSystem: 'POS',
      },
    });
    console.info('Created price list IN-FP-INR.');
  }

  const storePriceList = await prisma.storePriceList.findUnique({
    where: { storeId_priceListId: { storeId: store.id, priceListId: priceList.id } },
  });
  if (storePriceList) {
    console.info('Store price list assignment already exists.');
  } else {
    await prisma.storePriceList.create({
      data: {
        storeId: store.id,
        priceListId: priceList.id,
        priority: 100,
      },
    });
    console.info('Assigned price list IN-FP-INR to store IN-BOM-01.');
  }

  const effectiveFrom = new Date('2020-01-01T00:00:00.000Z');

  for (const item of MOCK_PRODUCTS) {
    const existingProduct = await prisma.product.findUnique({
      where: { organizationId_sapArticle: { organizationId, sapArticle: item.sapArticle } },
      include: { variants: true },
    });
    if (existingProduct) {
      console.info(`Product ${item.sapArticle} already exists.`);
      continue;
    }

    const existingSku = await prisma.productVariant.findUnique({ where: { sku: item.sku } });
    if (existingSku) {
      console.info(`SKU ${item.sku} already exists globally; skipping product ${item.sapArticle}.`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        sapArticle: item.sapArticle,
        styleNumber: item.styleNumber,
        name: item.name,
        taxClassCode: 'STANDARD',
        status: ActiveStatus.ACTIVE,
        variants: {
          create: {
            sku: item.sku,
            color: item.color,
            size: item.size,
            status: ActiveStatus.ACTIVE,
          },
        },
      },
      include: { variants: true },
    });

    const variant = product.variants[0]!;

    await prisma.barcode.create({
      data: {
        organizationId,
        variantId: variant.id,
        symbology: 'EAN13',
        value: item.barcode,
        isPrimary: true,
      },
    });

    await prisma.priceListItem.create({
      data: {
        priceListId: priceList.id,
        variantId: variant.id,
        unitPrice: item.unitPrice,
        effectiveFrom,
        sourceDocument: 'mock-seeder',
      },
    });

    await prisma.stockPosition.create({
      data: {
        storeId: store.id,
        sku: variant.sku,
        onHand: '25',
        availableToSell: '25',
        reserved: '0',
        sourceSystem: 'POS',
        asOf: new Date(),
      },
    });

    console.info(`Created product ${item.sapArticle} (SKU ${item.sku}).`);
  }
}

async function ensureStoreAdmin(
  prisma: PrismaClient,
  organization: Organization,
  store: Store,
  passwordHasher: PasswordHasher,
) {
  const permission = await prisma.permission.findFirst({
    where: { code: STORE_ADMIN_PERMISSION_CODE },
  });
  if (!permission) {
    throw new Error(`Permission "${STORE_ADMIN_PERMISSION_CODE}" missing. Run default permission seeders first.`);
  }

  let role = await prisma.role.findUnique({
    where: { organizationId_code: { organizationId: organization.id, code: STORE_ADMIN_ROLE_CODE } },
  });
  if (role) {
    console.info(`Role ${STORE_ADMIN_ROLE_CODE} already exists.`);
  } else {
    role = await prisma.role.create({
      data: {
        organizationId: organization.id,
        code: STORE_ADMIN_ROLE_CODE,
        name: STORE_ADMIN_ROLE_NAME,
        description: 'Store-scoped admin for a single location',
      },
    });
    console.info(`Created role ${STORE_ADMIN_ROLE_CODE}.`);
  }

  const rolePermission = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
  });
  if (rolePermission) {
    console.info(`Role ${STORE_ADMIN_ROLE_CODE} already has permission ${STORE_ADMIN_PERMISSION_CODE}.`);
  } else {
    await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: permission.id },
    });
    console.info(`Attached permission ${STORE_ADMIN_PERMISSION_CODE} to ${STORE_ADMIN_ROLE_CODE}.`);
  }

  let user = await prisma.appUser.findFirst({
    where: { organizationId: organization.id, email: MOCK_STORE_ADMIN_EMAIL },
  });
  if (user) {
    console.info(`Store admin ${MOCK_STORE_ADMIN_EMAIL} already exists.`);
  } else {
    user = await prisma.appUser.create({
      data: {
        displayName: 'Mock Store Admin',
        externalSubject: 'Mock Store Admin',
        email: MOCK_STORE_ADMIN_EMAIL,
        pinHash: await passwordHasher.hash('mock@123'),
        pinSetAt: new Date(),
        status: AppUserStatus.ACTIVE,
        employeeNumber: 'MOCK0000002',
        organizationId: organization.id,
      },
    });
    console.info(`Created store admin ${MOCK_STORE_ADMIN_EMAIL}.`);
  }

  const assignment = await prisma.userAssignment.findFirst({
    where: {
      userId: user.id,
      roleId: role.id,
      scopeType: ScopeType.STORE,
      scopeId: store.id,
    },
  });
  if (assignment) {
    console.info(`Store admin STORE assignment to ${store.code} already exists.`);
  } else {
    await prisma.userAssignment.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: ScopeType.STORE,
        scopeId: store.id,
      },
    });
    console.info(`Assigned store admin to store ${store.code}.`);
  }
}
