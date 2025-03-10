document.addEventListener('DOMContentLoaded', function() {
  // Modaali funktsionaalsus
  const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
  
  // Funktsioon pankade laadimiseks
  async function loadBanks() {
    try {
      const response = await fetch('/api/banks');
      if (!response.ok) {
        throw new Error('Viga pankade laadimisel');
      }
      
      const banks = await response.json();
      
      // Tühjenda valikud
      const fromBankSelect = document.getElementById('fromBankId');
      const toBankSelect = document.getElementById('toBankId');
      
      // Säilita ainult esimene valik (placeholder)
      fromBankSelect.innerHTML = '<option value="">Vali pank</option>';
      toBankSelect.innerHTML = '<option value="">Vali pank</option>';
      
      // Lisa pangad mõlemasse valikmenüüsse
      banks.forEach(bank => {
        const fromOption = document.createElement('option');
        fromOption.value = bank.id;
        fromOption.textContent = `${bank.name} (${bank.balance}€)`;
        fromBankSelect.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = bank.id;
        toOption.textContent = `${bank.name}`;
        toBankSelect.appendChild(toOption);
      });
      
      // Täida pankade tabel
      const banksList = document.getElementById('banksList');
      banksList.innerHTML = '';
      
      banks.forEach(bank => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${bank.name}</td>
          <td>${bank.balance}€</td>
        `;
        banksList.appendChild(row);
      });
    } catch (error) {
      showNotification('Viga', error.message);
    }
  }
  
  // Funktsioon ülekannete laadimiseks
  async function loadTransactions() {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Viga ülekannete laadimisel');
      }
      
      const transactions = await response.json();
      
      // Täida ülekannete tabel
      const transactionsList = document.getElementById('transactionsList');
      transactionsList.innerHTML = '';
      
      // Näita viimased 10 ülekannet (või vähem kui neid on vähem)
      const recentTransactions = transactions.slice(-10).reverse();
      
      recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const date = new Date(transaction.timestamp);
        row.innerHTML = `
          <td>${transaction.fromBankName}</td>
          <td>${transaction.toBankName}</td>
          <td>${transaction.amount}€</td>
          <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
        `;
        transactionsList.appendChild(row);
      });
    } catch (error) {
      showNotification('Viga', error.message);
    }
  }
  
  // Funktsioon teadete näitamiseks modaalis
  function showNotification(title, message) {
    document.getElementById('notificationModalLabel').textContent = title;
    document.getElementById('notificationModalBody').textContent = message;
    notificationModal.show();
  }
  
  // Panga registreerimise vormi töötlemine
  document.getElementById('registerBankForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      const name = document.getElementById('bankName').value;
      const apiUrl = document.getElementById('apiUrl').value;
      
      const response = await fetch('/api/banks/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, apiUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga panga registreerimisel');
      }
      
      const data = await response.json();
      
      // Näita API võtit modaalis
      showNotification(
        'Pank edukalt registreeritud',
        `Panga nimi: ${data.name}\nAPI võti: ${data.apiKey}\n\nHoia see API võti kindlas kohas!`
      );
      
      // Tühjenda vorm
      document.getElementById('bankName').value = '';
      document.getElementById('apiUrl').value = '';
      
      // Lae pangad uuesti
      loadBanks();
      
    } catch (error) {
      showNotification('Viga', error.message);
    }
  });
  
  // Ülekande vormi töötlemine
  document.getElementById('transactionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      const fromBankId = document.getElementById('fromBankId').value;
      const toBankId = document.getElementById('toBankId').value;
      const apiKey = document.getElementById('apiKey').value;
      const amount = document.getElementById('amount').value;
      const description = document.getElementById('description').value;
      
      if (fromBankId === toBankId) {
        throw new Error('Lähte- ja sihtpank ei saa olla samad');
      }
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          fromBankId,
          toBankId,
          amount,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga ülekande tegemisel');
      }
      
      const data = await response.json();
      
      // Näita edukat ülekannet
      showNotification(
        'Ülekanne õnnestus',
        `Ülekanne summas ${amount}€ on edukalt tehtud.\nSinu konto jääk: ${data.fromBankBalance}€`
      );
      
      // Tühjenda vorm
      document.getElementById('amount').value = '';
      document.getElementById('description').value = '';
      
      // Lae andmed uuesti
      loadBanks();
      loadTransactions();
      
    } catch (error) {
      showNotification('Viga', error.message);
    }
  });
  
  // Lae andmed lehe laadimisel
  loadBanks();
  loadTransactions();
  
  // Värskenda andmeid iga 30 sekundi järel
  setInterval(() => {
    loadBanks();
    loadTransactions();
  }, 30000);
});