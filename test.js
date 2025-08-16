#!/usr/bin/env node
const axios = require('axios');
const readline = require('readline');

const PHP_BASE = 'https://example.com'; // langsung fixed
const INTERVAL_MS = 5000; // 5 detik
const TIMEOUT_MS = 600000; // 10 menit
const WITH_POLL_HIT = true;

const http = axios.create({
  timeout: 15000,
  headers: { 'User-Agent': 'qris-cli/1.0' }
});

function log(...args) { console.log(new Date().toISOString(), '-', ...args); }

async function createOrder(amount) {
  const params = { action: 'create_order', amount };
  const { data } = await http.get(`${PHP_BASE}/index.php`, { params });
  if (!data?.success) throw new Error(data?.error || 'create_order gagal');
  return data.order;
}

async function getStatus(orderId) {
  const { data } = await http.get(`${PHP_BASE}/index.php`, {
    params: { action: 'status', id: orderId }
  });
  if (!data?.success) throw new Error(data?.error || 'status gagal');
  return data.order;
}

async function hitPoll() {
  try {
    await http.get(`${PHP_BASE}/index.php`, { params: { action: 'poll' } });
  } catch {}
}

async function main() {
  // input amount
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const amount = await new Promise(resolve => {
    rl.question('Masukkan nominal (tanpa kode unik): ', ans => {
      rl.close();
      resolve(Number(ans.trim()));
    });
  });

  if (!amount || amount < 100) {
    console.error('Nominal minimal 100');
    process.exit(1);
  }

  log('Membuat order di server...');
  const order = await createOrder(amount);
  log(`OrderId=${order.id}, base=${order.base_amount}, unik=${order.unique_code}, total=${order.total_amount}`);
  log('QR URL:', order.qris_url);
  log('Berlaku s/d:', order.expires_at);
  log('Menunggu pembayaran...');

  const start = Date.now();
  let lastPollHit = 0;

  if (WITH_POLL_HIT) await hitPoll();

  while (true) {
    if (Date.now() - start > TIMEOUT_MS) {
      log('❌ Timeout menunggu pembayaran.');
      process.exit(1);
    }

    let st;
    try {
      st = await getStatus(order.id);
    } catch (e) {
      log('Gagal cek status:', e.message);
    }

    if (st) {
      const status = String(st.status || '').toUpperCase();
      if (status === 'PAID') {
        log('✅ LUNAS:', `paid_at=${st.paid_at}, mutation_id=${st.mutation_id}`);
        process.exit(0);
      } else if (status === 'EXPIRED' || status === 'CANCELED') {
        log(`❌ ${status}:`, `orderId=${order.id}`);
        process.exit(1);
      } else {
        log('Status:', status, '- menunggu...');
      }
    }

    if (WITH_POLL_HIT && Date.now() - lastPollHit > 10000) {
      lastPollHit = Date.now();
      hitPoll();
    }

    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
}

main().catch(e => {
  log('ERROR:', e.message || e);
  process.exit(2);
});
