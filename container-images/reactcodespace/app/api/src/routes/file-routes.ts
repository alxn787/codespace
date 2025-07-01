import express from 'express';
import {
  createFile,
  createFolder,
  deleteFile,
  deleteFolder,
  getAllFolders,
  readFile,
  readFolder,
  renameFolder,
  updateFile,
} from '../controllers/file-controller.js';

const router = express.Router();

router.get('/all', getAllFolders);
router.post('/create', createFile);
router.post('/read', readFile);
router.put('/update', updateFile);
router.delete('/delete', deleteFile);

router.post('/create-folder', createFolder);
router.delete('/delete-folder', deleteFolder);
router.get('/read-folder', readFolder);
router.post('/rename-folder', renameFolder);

export default router;
