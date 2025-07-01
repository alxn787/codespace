import fs from 'fs';
import path from 'path';

interface FileInfo {
  id: string;
  name: string;
  isDirectory: boolean;
  children: FileInfo[];
}

export function listFolders(directory: string): FileInfo {
  const folderData: FileInfo = {
    id: directory,
    name: path.basename(directory),
    isDirectory: true,
    children: [],
  };

  const files = fs.readdirSync(directory);
  const seenPaths = new Set<string>();

  files.forEach((file) => {
    if (file === 'node_modules' || file === path.basename(directory)) {
      return;
    }

    const filePath = path.join(directory, file);

    if (!seenPaths.has(filePath)) {
      seenPaths.add(filePath);

      const fileInfo: FileInfo = {
        id: filePath,
        name: file,
        isDirectory: fs.statSync(filePath).isDirectory(),
        children: [],
      };

      if (fileInfo.isDirectory) {
        fileInfo.children = listFolders(filePath).children.filter(
          (child) => child.id !== fileInfo.id
        );
      }

      folderData.children.push(fileInfo);
    }
  });

  return folderData;
}
