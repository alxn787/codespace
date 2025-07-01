import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

import fileRoute from './routes/file-routes.js';
import terminalRoute from './routes/terminal-routes.js';

app.use('/api/v1/files', fileRoute);
app.use('/api/v1/terminal', terminalRoute);

app.get('/health', (req, res) => {
  res.status(200).json({
    message: "reactcodespace is running",
  });
});

app.listen(5001, () => {
  console.log('server is running on port 5001');
});
