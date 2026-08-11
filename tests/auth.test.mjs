import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.ts';

function makeD1() {
  const stmt = {
    bind() { return stmt; },
    async run() { return { success: true }; },
    async all() { return { results: [] }; },
    async first() { return null; },
  };
  return { prepare() { return stmt; } };
}

function makeEnv(overrides = {}) {
  return {
    DB: makeD1(),
    CACHE: { get: async () => null, put: async () => {} },
    ENGINE_RUNTIME: { fetch: async () => new Response(JSON.stringify({ response: 'ok' })) },
    ECHO_API_KEY: 'test-echo-feedback-board-key-2d9c',
    AE: { writeDataPoint: () => {} },
    ...overrides,
  };
}

test('GET /health, /, /status need no auth (unchanged public contract)', async () => {
  const env = makeEnv();
  for (const p of ['/', '/health', '/status']) {
    const res = await worker.fetch(new Request('https://x' + p), env);
    assert.notEqual(res.status, 401);
  }
});

test('GET /public/:tenant/boards is public with no auth (unchanged -- this is the feedback-board product)', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/public/t1/boards'), env);
  assert.notEqual(res.status, 401);
});

test('a management GET (e.g. /posts) with NO key is rejected -- unlike the last few repos, this one already gated GET correctly', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1'), env);
  assert.equal(res.status, 401);
});

test('a management GET with the WRONG key is rejected', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1', {
    headers: { 'X-Echo-API-Key': 'wrong-key' },
  }), env);
  assert.equal(res.status, 401);
});

test('a management GET with the CORRECT key is accepted', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1', {
    headers: { 'X-Echo-API-Key': 'test-echo-feedback-board-key-2d9c' },
  }), env);
  assert.notEqual(res.status, 401);
});

test('the Authorization: Bearer header also works for auth (both credential paths use the fixed comparison)', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1', {
    headers: { 'Authorization': 'Bearer test-echo-feedback-board-key-2d9c' },
  }), env);
  assert.notEqual(res.status, 401);
});

test('with no ECHO_API_KEY configured, auth fails closed (never open) even with a matching-looking header', async () => {
  const env = makeEnv({ ECHO_API_KEY: undefined });
  const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1', {
    headers: { 'X-Echo-API-Key': 'anything' },
  }), env);
  assert.equal(res.status, 401);
});

test('a management POST (e.g. /boards) requires auth too, not just GET', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/boards', {
    method: 'POST',
    body: JSON.stringify({ name: 'x' }),
    headers: { 'Content-Type': 'application/json' },
  }), env);
  assert.equal(res.status, 401);
});

test('POST /public/:tenant/posts (public feedback submission) stays unauthenticated (unchanged)', async () => {
  const env = makeEnv();
  const res = await worker.fetch(new Request('https://x/public/t1/posts', {
    method: 'POST',
    body: JSON.stringify({ board_id: 'b1', title: 'x', author_email: 'a@b.com' }),
    headers: { 'Content-Type': 'application/json' },
  }), env);
  assert.notEqual(res.status, 401);
});

test('key-length side-channel: a same-length wrong key and a different-length wrong key both fail identically', async () => {
  const env = makeEnv();
  for (const key of ['test-echo-feedback-board-key-XXXX', 'x']) {
    const res = await worker.fetch(new Request('https://x/posts?tenant_id=t1', { headers: { 'X-Echo-API-Key': key } }), env);
    assert.equal(res.status, 401);
  }
});
