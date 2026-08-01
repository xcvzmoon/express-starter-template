import { Router } from 'express';

const authRouter = Router();

authRouter.get('/', (_req, res) => {
    res.status(200).json({ message: 'Auth route is working' });
});

export default authRouter;
