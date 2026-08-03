import { Router } from 'express';

const router = Router();

// Feature routers are mounted here as they land. /api/health is registered
// directly in app.ts so probes bypass the rate limiter.

export default router;
