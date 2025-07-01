import express from 'express';
import { executeCommand } from '../controllers/terminal-controller.js';
const router = express.Router();

router.post('/execute', executeCommand);

export default router;
