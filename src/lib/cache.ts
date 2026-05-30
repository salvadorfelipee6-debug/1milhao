export const redis = {
  get:    async (_key: string): Promise<any> => null,
  set:    async (_key: string, _value: unknown, _opts?: unknown): Promise<any> => null,
  del:    async (_key: string): Promise<any> => null,
  pipeline: () => ({
    zremrangebyscore: () => {},
    zadd:             () => {},
    zcard:            () => {},
    expire:           () => {},
    exec:             async () => [0, 0, 0, 0] as any,
  }),
}

export async function rateLimit(_identifier: string) {
  return { success: true, remaining: 10 }
}
