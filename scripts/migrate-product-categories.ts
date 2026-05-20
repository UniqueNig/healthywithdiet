import { loadEnvConfig } from '@next/env';
import postgres from 'postgres';

loadEnvConfig(process.cwd());

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

async function main() {
  // Drop the old enum column (and the enum type itself).
  await sql.unsafe(`ALTER TABLE "products" DROP COLUMN IF EXISTS "category";`);
  console.log('✓ Dropped products.category column.');

  await sql.unsafe(`DROP TYPE IF EXISTS "product_category";`);
  console.log('✓ Dropped product_category enum type.');

  // Create the new product_categories table.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "product_categories" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "description" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
  console.log('✓ Created product_categories table.');

  // Add category_id FK on products.
  await sql.unsafe(`
    ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "category_id" uuid
    REFERENCES "product_categories"("id") ON DELETE SET NULL;
  `);
  console.log('✓ Added products.category_id column.');

  // Seed three starter categories so the admin has something to pick today.
  await sql.unsafe(`
    INSERT INTO "product_categories" ("slug", "name", "description") VALUES
      ('ebook', 'Ebook', 'Downloadable books and guides'),
      ('template', 'Template', 'Editable templates and worksheets'),
      ('guide', 'Guide', 'Step-by-step practical guides')
    ON CONFLICT ("slug") DO NOTHING;
  `);
  console.log('✓ Seeded starter categories.');

  await sql.end();
  console.log('\nMigration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
