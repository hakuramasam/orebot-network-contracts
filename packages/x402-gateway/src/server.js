import 'dotenv/config';
import express from 'express';
import adminRoutes from './routes/admin.js';
import topupRoutes from './routes/topup.js';
import protectedRoutes from './routes/protected.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', package: '@orebot/x402-gateway', network: 'Base', chain_id: 8453 }));
app.use('/admin', adminRoutes);
app.use('/v1/credits', topupRoutes);
app.use('/v1', protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`@orebot/x402-gateway running on :${PORT}`));
