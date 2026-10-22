import { PasswordHasher } from '@nestjs/authentication';
import { ActiveStatus, PrismaClient, StoreConcept, StoreStatus } from '../../dist/generated/prisma/client.js';

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
  const orgUuid = crypto.randomUUID();
  const passwordHasher = new PasswordHasher();

  const region = await prisma.region.findFirst({ where: { code: 'APAC' } });
  const country = await prisma.country.findFirst({ where: { isoCode: 'IN' } });
  if (!region || !country) {
    throw new Error('APAC region and/or India (IN) country missing. Run default region/country seeders first.');
  }

  const organization = await prisma.organization.create({
    data: {
      legalName: `Mock Organization - ${orgUuid}`,
      code: orgUuid,
      createdBy: 'Mock Seeder',
      updatedBy: 'Mock Seeder',
    },
  });

  const organizationAdmin = await prisma.appUser.create({
    data: {
      displayName: 'Mock Admin',
      externalSubject: 'Mock Seeder',
      email: 'johndoe@mock.com',
      pinHash: await passwordHasher.hash('mock@123'),
      pinSetAt: new Date(),
      status: 'ACTIVE',
      employeeNumber: 'MOCK0000001',
      organizationId: organization.id,
    },
  });

  await prisma.organizationRegion.upsert({
    where: {
      organizationId_regionId: { organizationId: organization.id, regionId: region.id },
    },
    create: { organizationId: organization.id, regionId: region.id },
    update: {},
  });

  await prisma.organizationCountry.upsert({
    where: {
      organizationId_countryId: { organizationId: organization.id, countryId: country.id },
    },
    create: {
      organizationId: organization.id,
      countryId: country.id,
      regionId: country.regionId,
    },
    update: {},
  });

  const brand = await prisma.brand.upsert({
    where: {
      organizationId_code: { organizationId: organization.id, code: 'MOCK' },
    },
    create: {
      organizationId: organization.id,
      code: 'MOCK',
      name: 'Mock Brand',
      status: ActiveStatus.ACTIVE,
      createdBy: 'Mock Seeder',
      updatedBy: 'Mock Seeder',
    },
    update: {},
  });

  const existingStore = await prisma.store.findFirst({
    where: { organizationId: organization.id, code: 'IN-BOM-01' },
  });
  if (existingStore) {
    console.info(
      `Generated mock organization ${organizationAdmin.email}; store IN-BOM-01 already present, skipping catalogue.`,
    );
    return;
  }

  const store = await prisma.store.create({
    data: {
      organizationId: organization.id,
      brandId: brand.id,
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

  await prisma.category.create({
    data: {
      organizationId: organization.id,
      code: 'MOCK',
      name: 'Mock Category',
    },
  });

  const priceList = await prisma.priceList.create({
    data: {
      organizationId: organization.id,
      code: 'IN-FP-INR',
      currencyCode: 'INR',
      brandId: brand.id,
      countryId: country.id,
      concept: 'FULL_PRICE',
      sourceSystem: 'POS',
    },
  });

  await prisma.storePriceList.create({
    data: {
      storeId: store.id,
      priceListId: priceList.id,
      priority: 100,
    },
  });

  const effectiveFrom = new Date('2020-01-01T00:00:00.000Z');
  // SKU is globally unique; suffix with org id fragment so re-runs can create new orgs.
  const skuSuffix = orgUuid.replace(/-/g, '').slice(0, 8);

  for (const item of MOCK_PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        organizationId: organization.id,
        sapArticle: item.sapArticle,
        styleNumber: item.styleNumber,
        name: item.name,
        taxClassCode: 'STANDARD',
        status: ActiveStatus.ACTIVE,
        variants: {
          create: {
            sku: `${item.sku}-${skuSuffix}`,
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
        organizationId: organization.id,
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
  }

  console.info(
    `Generated mock organization... Admin is ${organizationAdmin.email}; attached APAC/IN; store ${store.code}; ${MOCK_PRODUCTS.length} products (INR).`,
  );
}
