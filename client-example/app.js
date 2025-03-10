document.addEventListener('DOMContentLoaded', function() {
  // Modaali funktsionaalsus
  const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
  
  // Salvestatud konfiguratsioon
  let pangaKlient = null;
  
  // Funktsioon teadete näitamiseks modaalis
  function showNotification(title, message) {
    document.getElementById('notificationModalLabel').textContent = title;
    document.getElementById('notificationModalBody').textContent = message;
    notificationModal.show();
  }
  
  // Lae salvestatud konfiguratsioon
  function loadConfig() {
    const apiKey = localStorage.getItem('apiKey');
    const pangaId = localStorage.getItem('pangaId');
    const keskpangaUrl = localStorage.getItem('keskpangaUrl') || 'http://localhost:3000';
    
    if (apiKey && pangaId) {
      document.getElementById('apiKey').value = apiKey;
      document.getElementById('pangaId').value = pangaId;
      document.getElementById('keskpangaUrl').value = keskpangaUrl;
      
      // Loo panga klient
      pangaKlient = new PangaKlient(apiKey, pangaId, keskpangaUrl);
      
      // Näita info ja tehingute sektsioone
      document.getElementById('infoSection').style.display = 'flex';
      document.getElementById('tehingudSection').style.display = 'block';
      
      // Lae panga info ja tehingud
      loadPangaInfo();
      loadTehingud();
      loadPangad();
    }
  }
  
  // Lae panga info
  async function loadPangaInfo() {
    try {
      if (!pangaKlient) return;
      
      const pangaInfo = await pangaKlient.getPangaInfo();
      const infoContainer = document.getElementById('pangaInfo');
      
      infoContainer.innerHTML = `
        <div class="card-text">
          <p><strong>Panga nimi:</strong> ${pangaInfo.name}</p>
          <p><strong>Konto jääk:</strong> ${pangaInfo.balance}€</p>
          <p><strong>Panga ID:</strong> <span class="text-muted">${pangaInfo.id}</span></p>
        </div>
      `;
    } catch (error) {
      showNotification('Viga', error.message);
    }
  }
  
  // Lae panga tehingud
  async function loadTehingud() {
    try {
      if (!pangaKlient) return;
      
      const tehingud = await pangaKlient.getTehingud();
      const tehingudList = document.getElementById('tehingudList');
      
      tehingudList.innerHTML = '';
      
      if (tehingud.length === 0) {
        tehingudList.innerHTML = `<tr><td colspan="5" class="text-center">Tehinguid pole veel tehtud</td></tr>`;
        return;
      }
      
      // Sorteeri tehingud aja järgi kahanevas järjekorras (uuemad eespool)
      tehingud.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      tehingud.forEach(tehing => {
        const row = document.createElement('tr');
        const date = new Date(tehing.timestamp);
        row.innerHTML = `
          <td>${tehing.fromBankName}</td>
          <td>${tehing.toBankName}</td>
          <td class="${tehing.fromBankId === pangaKlient.pangaId ? 'text-danger' : 'text-success'}">${
          tehing.fromBankId === pangaKlient.pangaId ? '-' : '+'}${tehing.amount}€</td>
          <td>${tehing.description}</td>
          <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
        `;
        tehingudList.appendChild(row);
      });
    } catch (error) {
      showNotification('Viga', error.message);
    }
  }
  
  // Lae pankade nimekiri
  async function loadPangad() {
    try {
      if (!pangaKlient) return;
      
      const pangad = await pangaKlient.getPangad();
      const sihtpankSelect = document.getElementById('sihtpank');
      
      // Säilita ainult esimene valik (placeholder)
      sihtpankSelect.innerHTML = '<option value="">Vali pank</option>';
      
      // Lisa pangad valikmenüüsse, välja arvatud oma pank
      pangad.forEach(pank => {
        if (pank.id !== pangaKlient.pangaId) {
          const option = document.createElement('option');
          option.value = pank.id;
          option.textContent = pank.name;
          sihtpankSelect.appendChild(option);
        }
      });
    } catch (error) {
      showNotification('Viga', error.message);
    }
  }
  
  // Konfiguratsioonivormi töötlemine
  document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const apiKey = document.getElementById('apiKey').value;
    const pangaId = document.getElementById('pangaId').value;
    const keskpangaUrl = document.getElementById('keskpangaUrl').value;
    
    if (!apiKey || !pangaId) {
      showNotification('Viga', 'API võti ja panga ID on kohustuslikud');
      return;
    }
    
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('pangaId', pangaId);
    localStorage.setItem('keskpangaUrl', keskpangaUrl);
    
    pangaKlient = new PangaKlient(apiKey, pangaId, keskpangaUrl);
    
    // Näita info ja tehingute sektsioone
    document.getElementById('infoSection').style.display = 'flex';
    document.getElementById('tehingudSection').style.display = 'block';
    
    // Lae panga info ja tehingud
    loadPangaInfo();
    loadTehingud();
    loadPangad();
    
    showNotification('Info', 'Konfiguratsioon on salvestatud');
  });
  
  // Ülekande vormi töötlemine
  document.getElementById('ylakanneForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
      if (!pangaKlient) {
        throw new Error('Panga klient pole konfigureeritud');
      }
      
      const sihtpangaId = document.getElementById('sihtpank').value;
      const summa = document.getElementById('summa').value;
      const kirjeldus = document.getElementById('kirjeldus').value;
      
      if (!sihtpangaId) {
        throw new Error('Sihtpank on valimata');
      }
      
      if (!summa || summa <= 0) {
        throw new Error('Summa peab olema positiivne arv');
      }
      
      const tulemus = await pangaKlient.teeYlekanne(sihtpangaId, parseFloat(summa), kirjeldus);
      
      showNotification('Ülekanne õnnestus', `Ülekanne summas ${summa}€ on edukalt tehtud. Sinu konto jääk: ${tulemus.fromBankBalance}€`);
      
      // Tühjenda vorm
      document.getElementById('summa').value = '';
      document.getElementById('kirjeldus').value = 'Ülekanne';
      
      // Lae andmed uuesti
      loadPangaInfo();
      loadTehingud();
    } catch (error) {
      showNotification('Viga', error.message);
    }
  });
  
  // Värskenduse nuppude funktsionaalsus
  document.getElementById('refreshInfo').addEventListener('click', loadPangaInfo);
  document.getElementById('refreshTehingud').addEventListener('click', loadTehingud);
  
  // Lae konfiguratsioon lehe laadimisel
  loadConfig();
});