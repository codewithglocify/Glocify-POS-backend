import { ActiveStatus, PrismaClient, StoreConcept, StoreStatus } from '../../dist/generated/prisma/client.js';

/**
 * Seeds demo catalogue data onto the first organization (typically from mock-organization).
 * Safe to re-run: skips when the demo store code already exists.
 */
export default async function (prisma: PrismaClient) {
  const organization = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!organization) {
    console.warn('No organization found; skip demo catalogue seed (run mock-organization first).');
    return;
  }

  const existingStore = await prisma.store.findFirst({
    where: { organizationId: organization.id, code: 'US-DEMO-01' },
  });

  if (existingStore) {
    console.info('Demo catalogue already present; skipping.');
    return;
  }

  const region = await prisma.region.findFirst({ where: { code: 'NAM' } });
  const country = await prisma.country.findFirst({ where: { isoCode: 'US' } });
  if (!region || !country) {
    console.warn('NAM/US master data missing; skip demo catalogue seed.');
    return;
  }

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
      organizationId_code: { organizationId: organization.id, code: 'DEMO' },
    },
    create: {
      organizationId: organization.id,
      code: 'DEMO',
      name: 'Demo Brand',
      status: ActiveStatus.ACTIVE,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
    update: {},
  });

  const store = await prisma.store.create({
    data: {
      organizationId: organization.id,
      brandId: brand.id,
      countryId: country.id,
      code: 'US-DEMO-01',
      name: 'Demo US Store',
      concept: StoreConcept.FULL_PRICE,
      timezone: country.timezone,
      currencyCode: country.defaultCurrencyCode,
      languageCode: country.defaultLanguageCode,
      status: StoreStatus.LIVE,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  await prisma.category.create({
    data: {
      organizationId: organization.id,
      code: 'WATCH',
      name: 'Watches',
    },
  });

  const product = await prisma.product.create({
    data: {
      organizationId: organization.id,
      sapArticle: 'ART-10001',
      styleNumber: 'FS1001',
      name: 'Classic Watch',
      taxClassCode: 'STANDARD',
      status: ActiveStatus.ACTIVE,
      variants: {
        create: {
          sku: 'FS1001-BLK-STD',
          color: 'BLK',
          size: 'STD',
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
      value: '4000000000016',
      isPrimary: true,
    },
  });

  const priceList = await prisma.priceList.create({
    data: {
      organizationId: organization.id,
      code: 'US-FP-USD',
      currencyCode: 'USD',
      brandId: brand.id,
      countryId: country.id,
      concept: 'FULL_PRICE',
      sourceSystem: 'POS',
    },
  });

  await prisma.priceListItem.create({
    data: {
      priceListId: priceList.id,
      variantId: variant.id,
      unitPrice: '195.0000',
      effectiveFrom: new Date('2020-01-01T00:00:00.000Z'),
      sourceDocument: 'seed',
    },
  });

  await prisma.storePriceList.create({
    data: {
      storeId: store.id,
      priceListId: priceList.id,
      priority: 100,
    },
  });

  await prisma.stockPosition.create({
    data: {
      storeId: store.id,
      sku: variant.sku,
      onHand: '10',
      availableToSell: '10',
      reserved: '0',
      sourceSystem: 'POS',
      asOf: new Date(),
    },
  });

  console.info(`Demo catalogue seeded for org ${organization.code} store ${store.code}`);
}
