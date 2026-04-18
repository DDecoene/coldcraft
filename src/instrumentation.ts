export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDb } = await import('@/lib/db');
    try {
      await initDb();
      console.log('[instrumentation] initDb complete');
    } catch (err) {
      console.error('[instrumentation] initDb failed:', err);
    }
  }
}
