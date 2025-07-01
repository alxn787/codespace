import { exec } from 'child_process';
import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const absolutePath = path.join(__dirname, '../../../code');

export const executeCommand = (req: Request, res: Response) => {
  const { command } = req.body;

  exec(`cd ${absolutePath} && ${command}`, (err, stdout, stderr) => {
    if (err) {
      res.status(500).send({ message: 'Error executing command', error: err });
    } else {
      res.status(200).send({ message: 'Command executed', data: stdout });
    }
  });
};
