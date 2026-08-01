import { Router } from 'express';
import authRouter from './auth';
import emailRouter from './email';

const router = Router();

router.use('/auth', authRouter);
router.use('/email', emailRouter);

export default router;
