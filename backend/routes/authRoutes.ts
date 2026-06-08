import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/users', authController.createUser);
router.post('/login', authController.login);

export default router;
