const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(express.json());

const talkerPathResolver = path.resolve(__dirname, 'talker.json');

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// Inicio do Projeto.

const readFile = async () => (JSON.parse(await fs.readFile(talkerPathResolver, 'utf-8')));

app.get('/talker', async (_req, res) => {
  const talker = await readFile();
  res.status(200).json(talker);
});