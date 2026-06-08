import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import auth from '../middlewares/auth';

const router = Router();

router.post('/complete', auth, aiController.complete);

export default router;
