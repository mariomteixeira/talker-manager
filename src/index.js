const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const generateToken = require('./services/loginToken');

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

// VALIDANDO JSON do Talker.json

const readFile = async () => (JSON.parse(await fs.readFile(talkerPathResolver, 'utf-8')));

app.get('/talker', async (_req, res) => {
  const talker = await readFile();
  res.status(200).json(talker);
});

// VALIDANDO O ID DO PALESTRANTE

const validateId = async (ident) => {
  const talkerJSON = JSON.parse(await fs.readFile(talkerPathResolver, 'utf-8'));
  return talkerJSON.filter((talker) => talker.id === Number(ident));
};

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const [talkerResolved] = await validateId(id);
  if (!talkerResolved) { 
    return res.status(404)
  .json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(talkerResolved);
});

// CRIAÇÃO DE TOKEN PARA LOGIN

app.post('/login', async (req, res) => {
  const token = generateToken();
  res.status(200).json({ token });
});