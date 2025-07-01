import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { listFolders } from '../util/listFolders.js';
import { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const absolutePath = path.join(__dirname, '../../../code');

export const getAllFolders = (req: Request, res: Response) => {
  const folderData = listFolders(absolutePath);

  res.status(200).send({ message: 'Folder read', data: folderData });
};

export const createFile = (req: Request, res: Response) => {
  const { content, path } = req.body;

  fs.writeFile(path, content, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error creating file' });
    } else {
      res.status(200).send({ message: 'File created' });
    }
  });
};

export const readFile = (req: Request, res: Response) => {
  const { path } = req.body;

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send({ message: 'Error reading file' });
    } else {
      res.status(200).send({ message: 'File read', data });
    }
  });
};

export const updateFile = (req: Request, res: Response) => {
  const { path, content } = req.body;

  fs.writeFile(path, content, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error updating file', error: err });
    } else {
      res.status(200).send({ message: 'File updated' });
    }
  });
};

export const deleteFile = (req: Request, res: Response) => {
  const { path } = req.body;

  fs.unlink(path, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error deleting file' });
    } else {
      res.status(200).send({ message: 'File deleted' });
    }
  });
};

export const createFolder = (req: Request, res: Response) => {
  const { path } = req.body;

  fs.mkdir(path, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error creating folder' });
    } else {
      res.status(200).send({ message: 'Folder created' });
    }
  });
};

export const deleteFolder = (req: Request, res: Response) => {
  const { path } = req.body;

  fs.rm(path, { recursive: true }, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error deleting folder' });
    } else {
      res.status(200).send({ message: 'Folder deleted' });
    }
  });
};

export const readFolder = (req: Request, res: Response) => {
  const { folderName, path } = req.body;

  fs.readdir(
    `${absolutePath}/${path}/${folderName}`,
    { recursive: true },
    (err, files) => {
      if (err) {
        res.status(500).send({ message: 'Error reading folder' });
      } else {
        res.status(200).send({ message: 'Folder read', files });
      }
    }
  );
};

export const renameFolder = (req: Request, res: Response) => {
  const { oldPath, newPath } = req.body;

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      res.status(500).send({ message: 'Error renaming folder' });
    } else {
      res.status(200).send({ message: 'Folder renamed' });
    }
  });
};

export const listAllFolders = (req: Request, res: Response) => {
  const folderData = listFolders(absolutePath);

  res.status(200).send({ message: 'Folder read', data: folderData });
};
