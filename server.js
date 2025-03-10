const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Andmebaasi failid
const BANKS_FILE = path.join(__dirname, 'data', 'banks.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'data', 'transactions.json');

// Tagame, et andmebaasi kataloog eksisteerib
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Tagame, et vajalikud JSON failid eksisteerivad
if (!fs.existsSync(BANKS_FILE)) {
  fs.writeFileSync(BANKS_FILE, JSON.stringify({ banks: [] }));
}

if (!fs.existsSync(TRANSACTIONS_FILE)) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify({ transactions: [] }));
}

// Abifunktsioonid andmebaasi käsitlemiseks
function readBanks() {
  const data = fs.readFileSync(BANKS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeBanks(data) {
  fs.writeFileSync(BANKS_FILE, JSON.stringify(data, null, 2));
}

function readTransactions() {
  const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeTransactions(data) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(data, null, 2));
}

// Pankade API endpoint-id

// Registreeri uus pank
app.post('/api/banks/register', (req, res) => {
  try {
    const { name, apiUrl } = req.body;

    if (!name || !apiUrl) {
      return res.status(400).json({ error: 'Panga nimi ja API URL on kohustuslikud' });
    }

    const banks = readBanks();
    
    // Kontrolli, kas pank sama nimega juba eksisteerib
    const existingBank = banks.banks.find(bank => bank.name === name);
    if (existingBank) {
      return res.status(400).json({ error: 'Sellise nimega pank on juba registreeritud' });
    }

    // Genereeri uus api võti
    const apiKey = uuidv4();

    // Lisa uus pank
    const newBank = {
      id: uuidv4(),
      name,
      apiUrl,
      apiKey,
      balance: 1000, // Algne bilanss
      createdAt: new Date().toISOString()
    };

    banks.banks.push(newBank);
    writeBanks(banks);

    res.status(201).json({
      id: newBank.id,
      name: newBank.name,
      apiKey: newBank.apiKey,
      balance: newBank.balance
    });
  } catch (error) {
    console.error('Viga panga registreerimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga registreerimisel' });
  }
});

// Vaata kõiki registreeritud panku
app.get('/api/banks', (req, res) => {
  try {
    const banks = readBanks();
    // Tagasta piiratud info pankade kohta (ilma API võtmeteta)
    const simplifiedBanks = banks.banks.map(bank => ({
      id: bank.id,
      name: bank.name,
      balance: bank.balance
    }));
    res.json(simplifiedBanks);
  } catch (error) {
    console.error('Viga pankade laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga pankade laadimisel' });
  }
});

// Vaata ühe panga infot (API võtmega autentimine)
app.get('/api/banks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    const banks = readBanks();
    const bank = banks.banks.find(bank => bank.id === id);

    if (!bank) {
      return res.status(404).json({ error: 'Panka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (bank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    res.json({
      id: bank.id,
      name: bank.name,
      balance: bank.balance
    });
  } catch (error) {
    console.error('Viga panga info laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga info laadimisel' });
  }
});

// Ülekannete API endpoint-id

// Tee ülekanne ühelt pangalt teisele
app.post('/api/transactions', (req, res) => {
  try {
    const { fromBankId, toBankId, amount, description } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    if (!fromBankId || !toBankId || !amount) {
      return res.status(400).json({ error: 'Puuduvad vajalikud andmed ülekande tegemiseks' });
    }

    // Kontrolli, et summa on positiivne arv
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Summa peab olema positiivne arv' });
    }

    const banks = readBanks();
    
    // Leia lähtepank
    const fromBank = banks.banks.find(bank => bank.id === fromBankId);
    if (!fromBank) {
      return res.status(404).json({ error: 'Lähtepanka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (fromBank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    // Leia sihtpank
    const toBank = banks.banks.find(bank => bank.id === toBankId);
    if (!toBank) {
      return res.status(404).json({ error: 'Sihtpanka ei leitud' });
    }

    // Kontrolli, kas lähtepangal on piisavalt raha
    if (fromBank.balance < amount) {
      return res.status(400).json({ error: 'Kontol pole piisavalt raha' });
    }

    // Tee ülekanne
    fromBank.balance -= parseFloat(amount);
    toBank.balance += parseFloat(amount);

    // Salvesta muudatused
    writeBanks(banks);

    // Salvesta ülekanne ajalukku
    const transactions = readTransactions();
    const newTransaction = {
      id: uuidv4(),
      fromBankId,
      fromBankName: fromBank.name,
      toBankId,
      toBankName: toBank.name,
      amount: parseFloat(amount),
      description: description || 'Ülekanne',
      timestamp: new Date().toISOString()
    };

    transactions.transactions.push(newTransaction);
    writeTransactions(transactions);

    res.status(201).json({
      transaction: newTransaction,
      fromBankBalance: fromBank.balance
    });
  } catch (error) {
    console.error('Viga ülekande tegemisel:', error);
    res.status(500).json({ error: 'Serveri viga ülekande tegemisel' });
  }
});

// Vaata kõiki ülekandeid
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = readTransactions();
    res.json(transactions.transactions);
  } catch (error) {
    console.error('Viga ülekannete laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga ülekannete laadimisel' });
  }
});

// Vaata ühe panga ülekandeid
app.get('/api/transactions/bank/:bankId', (req, res) => {
  try {
    const { bankId } = req.params;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API võti puudub' });
    }

    const banks = readBanks();
    const bank = banks.banks.find(bank => bank.id === bankId);

    if (!bank) {
      return res.status(404).json({ error: 'Panka ei leitud' });
    }

    // Kontrolli, kas API võti on õige
    if (bank.apiKey !== apiKey) {
      return res.status(403).json({ error: 'Vale API võti' });
    }

    const transactions = readTransactions();
    const bankTransactions = transactions.transactions.filter(
      t => t.fromBankId === bankId || t.toBankId === bankId
    );

    res.json(bankTransactions);
  } catch (error) {
    console.error('Viga panga ülekannete laadimisel:', error);
    res.status(500).json({ error: 'Serveri viga panga ülekannete laadimisel' });
  }
});

// Serveri käivitamine
app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
});