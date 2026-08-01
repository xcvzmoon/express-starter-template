import { authController } from '../../controllers/auth.controller';
import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.post('/register', authController.register);

authRouter.post('/login', passport.authenticate('local', { session: false }), authController.login);

authRouter.get('/me', passport.authenticate('jwt', { session: false }), authController.me);

export default authRouter;
