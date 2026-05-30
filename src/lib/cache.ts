// Cache desativado temporariamente — ativar após configurar Upstash
export const redis = {
  get:    async (_key: string): Promise<any> => null,
  set:    async (_key: string, _value: unknown, _opts?: unknown) => null,
  del:    async (_key: string) => null,
  pipeline: () => ({
    zremrangebyscore: () => {},
    zadd:             () => {},
    zcard:            () => {},
    expire:           () => {},
    exec:             async () => [0, 0, 0, 0],
  }),
}

export async function rateLimit(_identifier: string) {
  return { success: true, remaining: 10 }
}
