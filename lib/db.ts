import { neon } from '@neondatabase/serverless';

// Lazy initialization — neon() faqat birinchi query vaqtida chaqiriladi,
// import vaqtida emas. Bu build xatosini oldini oladi.
let _sql: ReturnType<typeof neon> | null = null;

const sql = ((...args: Parameters<ReturnType<typeof neon>>) => {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return (_sql as any)(...args);
}) as ReturnType<typeof neon>;

export default sql;
