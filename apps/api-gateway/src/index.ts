import Fastify from 'fastify';
import cors from '@fastify/cors';
import rate from '@fastify/rate-limit';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(rate, { max: 200, timeWindow: '1 minute' });

const signing = process.env.SIGNING_URL ?? 'http://localhost:4030';

app.get('/health', async () => ({ ok: true }));

app.get('/api/session-by-token', async (req, reply) => {
  const token = (req.query as any).token;
  const r = await fetch(`${signing}/public/session-by-token?token=${encodeURIComponent(token)}`, {
    headers: {
      'user-agent': (req.headers['user-agent'] as string) ?? '',
      'x-forwarded-for': (req.headers['x-forwarded-for'] as string) ?? req.ip ?? '',
    }
  });
  reply.status(r.status).send(await r.text());
});

app.post('/api/sign', async (req, reply) => {
  const r = await fetch(`${signing}/public/sign`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': (req.headers['user-agent'] as string) ?? '',
      'x-forwarded-for': (req.headers['x-forwarded-for'] as string) ?? req.ip ?? '',
    },
    body: JSON.stringify(req.body)
  });
  reply.status(r.status).send(await r.text());
});

app.post('/api/finalize', async (req, reply) => {
  const r = await fetch(`${signing}/sessions/finalize`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req.body) });
  reply.status(r.status).send(await r.text());
});

await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
