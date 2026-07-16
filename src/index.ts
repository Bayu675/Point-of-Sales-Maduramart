import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import db from './db/sqlite.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());

// --- FRONTEND UI (PENGGANTI POSTMAN & SEEDER) ---
app.get('/', (req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sistem Kasir Minimalis</title>
      <style>
        body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; }
        button { padding: 10px 15px; margin: 5px 0; cursor: pointer; width: 100%; display: block; background: #007bff; color: white; border: none; border-radius: 4px; }
        button:hover { background: #0056b3; }
        pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h2>Sistem Kasir</h2>
      <p>Klik tombol di bawah untuk simulasi proses bisnis:</p>
      
      <button onclick="runSeed()">1. Jalankan Seeder (Isi Data Dummy)</button>
      <button onclick="runTx()">2. Proses Transaksi Kasir</button>
      <button onclick="runReport()">3. Lihat Laporan Penjualan</button>
      
      <h3>Output Log:</h3>
      <pre id="output">Belum ada aktivitas...</pre>
      
      <script>
        function runSeed() { fetchAPI('/api/seed', 'POST'); }
        function runTx() { fetchAPI('/api/transactions', 'POST', { user_id: 1, items: [{ product_id: 1, qty: 2 }, { product_id: 2, qty: 1 }] }); }
        function runReport() { fetchAPI('/api/reports/sales', 'GET'); }

        async function fetchAPI(url, method, body = null) {
          const output = document.getElementById('output');
          output.innerText = 'Loading...';
          try {
            const options = { method: method, headers: { 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(url, options);
            const data = await res.json();
            output.innerText = JSON.stringify(data, null, 2);
          } catch (err) {
            output.innerText = 'Error: ' + err.message;
          }
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// --- HELPER FUNCTIONS FOR SQLITE ---
// Bungkus query SQLite pake Promise biar bisa di-await dan rapi
const dbRun = (sql: string, params: unknown[] = []): Promise<{ id: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: { lastID: number }, err: Error | null) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
};

const dbAll = <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: unknown[]) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

// --- API ROUTES ---

// 1. SEED DUMMY DATA (Buat testing awal)
app.post('/api/seed', asyncHandler(async (req: Request, res: Response) => {
  // Insert User
  await dbRun(`INSERT INTO users (name, role) VALUES (?, ?)`, ['Kasir Satu', 'Cashier']);
  // Insert Category
  await dbRun(`INSERT INTO categories (name) VALUES (?)`, ['Elektronik']);
  // Insert Product
  await dbRun(`INSERT INTO products (category_id, name, price) VALUES (?, ?, ?)`, [1, 'Kabel Data Type-C', 25000]);
  await dbRun(`INSERT INTO products (category_id, name, price) VALUES (?, ?, ?)`, [1, 'Kepala Charger 20W', 75000]);
  
  res.status(201).json({ message: 'Data dummy berhasil di-generate! Silakan cek database.' });
}));

// 2. MAIN FLOW: TRANSAKSI KASIR
app.post('/api/transactions', asyncHandler(async (req: Request, res: Response) => {
  const { user_id, items } = req.body as { user_id: number; items: { product_id: number; qty: number }[] };

  if (!user_id || !items || items.length === 0) {
    throw new AppError('Data transaksi tidak lengkap. Pastikan user_id dan items terisi.', 400);
  }

  let total_amount = 0;
  const processedItems: { product_id: number; qty: number; subtotal: number }[] = [];

  // Hitung subtotal untuk setiap item berdasarkan harga di database
  for (const item of items) {
    const products = await dbAll<{ price: number }>(`SELECT price FROM products WHERE id = ?`, [item.product_id]);
    
    const product = products[0];
    if (!product) {
      throw new AppError(`Produk dengan ID ${item.product_id} tidak ditemukan.`, 404);
    }
    
    const price = product.price;
    const subtotal = price * item.qty;
    total_amount += subtotal;
    
    processedItems.push({
      product_id: item.product_id,
      qty: item.qty,
      subtotal
    });
  }

  // Insert ke tabel transactions
  const dateNow = new Date().toISOString();
  const insertTx = await dbRun(
    `INSERT INTO transactions (user_id, transaction_date, total_amount) VALUES (?, ?, ?)`,
    [user_id, dateNow, total_amount]
  );
  const transaction_id = insertTx.id;

  // Insert ke tabel transaction_details
  for (const detail of processedItems) {
    await dbRun(
      `INSERT INTO transaction_details (transaction_id, product_id, qty, subtotal) VALUES (?, ?, ?, ?)`,
      [transaction_id, detail.product_id, detail.qty, detail.subtotal]
    );
  }

  res.status(201).json({
    message: 'Transaksi berhasil diproses.',
    data: { transaction_id, total_amount, date: dateNow }
  });
}));

// 3. REPORTING FLOW: LAPORAN PENJUALAN
app.get('/api/reports/sales', asyncHandler(async (req: Request, res: Response) => {
  const query = `
    SELECT 
      t.id AS transaction_id,
      t.transaction_date,
      u.name AS cashier_name,
      p.name AS product_name,
      td.qty,
      td.subtotal
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    JOIN transaction_details td ON t.id = td.transaction_id
    JOIN products p ON td.product_id = p.id
    ORDER BY t.transaction_date DESC
  `;
  
  const reports = await dbAll(query);
  
  res.status(200).json({
    message: 'Laporan penjualan berhasil ditarik.',
    data: reports
  });
}));

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error('Unexpected Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server kasir berjalan lancar di http://localhost:${PORT}`);
});