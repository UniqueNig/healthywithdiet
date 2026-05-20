import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    console.error(
      'Missing one or more env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.',
    );
    console.error('Add them to .env.local temporarily, run this script, then remove them.');
    process.exit(1);
  }

  const { auth } = await import('@/lib/auth');

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    console.log('Admin user created:');
    console.log(`   Name:  ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   ID:    ${result.user.id}`);
    console.log('\nYou can now log in at /admin/login');
    console.log('\nIMPORTANT: remove ADMIN_EMAIL/PASSWORD/NAME from .env.local now.');
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to create admin user:', message);
    process.exit(1);
  }
}

main();
