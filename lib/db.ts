import { neon } from '@neondatabase/serverless';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

let _client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!_client) {
    _client = neon(process.env.DATABASE_URL!);
  }
  return _client;
}

// Lazy, typed tagged-template wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<Row[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (getClient() as any)(strings, ...values);
  return result as Row[];
}

export default sql;
