# Keskpanga süsteemi õpetus

See õpetus näitab, kuidas rakendada keskpanga süsteemi ja luua sellega suhtlev klientpanga rakendus.

## Eeltingimused

- Node.js (versioon 14 või uuem)
- npm (Node.js paketihaldur)
- Baasteadmised JavaScript'ist
- Baasteadmised HTTP päringute kohta

## 1. Keskpanga rakenduse paigaldamine

### Kloonige repositoorium

```bash
git clone https://github.com/JoonasMagi/pank.git
cd pank
```

### Paigaldage sõltuvused

```bash
npm install
```

### Käivitage server

```bash
npm start
```

Server käivitub pordil 3000. Saate keskpanga veebiliidest avada brauseris aadressil: 

```
http://localhost:3000
```

## 2. Panga registreerimine

Enne oma klientpanga rakenduse loomist peate registreerima panga keskpangas.

### Registreerige pank keskpanga veebiliidese kaudu

1. Avage keskpanga veebiliides brauseris (http://localhost:3000)
2. Sisestage vormi "Registreeri uus pank" oma panga nimi ja API URL
3. Klõpsake nupul "Registreeri"
4. Peale registreerimist kuvatakse teile API võti - **salvestage see kindlasse kohta!**

### Alternatiivselt: registreerige pank API kaudu

```bash
curl -X POST http://localhost:3000/api/banks/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Minu Pank","apiUrl":"http://localhost:8080"}'
```

Salvestage tagastatud `id` ja `apiKey` väärtused.

## 3. Klientpanga rakenduse loomine

Nüüd saate luua oma panga rakenduse, mis suhtleb keskpangaga.

### Kopeeri näidisklient

Kõige lihtsam viis alustamiseks on kopeerida kaasasolev näidisrakendus:

```bash
cp -r client-example minu-pank
cd minu-pank
```

### Muutke konfiguratsioon

Näidisrakendus kasutab konfigureerimiseks HTML vormi. Avage `index.html` ja sisestage keskpangas registreeritud API võti ja panga ID.

Alternatiivselt võite muuta `app.js` faili, et seada konfiguratsioon otse koodis:

```javascript
// Määra vaikimisi konfiguratsioon
localStorage.setItem('apiKey', 'sinu-api-voti');
localStorage.setItem('pangaId', 'sinu-panga-id');
localStorage.setItem('keskpangaUrl', 'http://localhost:3000');
```

### Käivitage klientrakendus

Kõige lihtsam viis klientrakenduse käivitamiseks on kasutada mõnda lihtsat HTTP serverit. Näiteks:

```bash
# Kui teil on Node.js installitud
npx http-server

# Või kui teil on Python installitud
python -m http.server
```

Nüüd saate avada klientrakenduse brauseris, tavaliselt aadressil `http://localhost:8080`.

## 4. Oma klientpanga rakenduse loomine

Kui soovite luua täiesti oma panga rakenduse, võite kasutada pakutud `panga-klient.js` teeki, mis lihtsustab keskpanga API-ga suhtlemist.

### Kopeeri klientteek

```bash
cp client-example/panga-klient.js oma-projekti-kaust/
```

### Kasuta klientteeki oma rakenduses

```javascript
// Impordi kliendi teek
// Skripti märgendi abil:
// <script src="panga-klient.js"></script>

// Loo panga klient
const pangaKlient = new PangaKlient(
  'sinu-api-voti',
  'sinu-panga-id',
  'http://localhost:3000'
);

// Vaata panga saldo
async function vaataSaldo() {
  try {
    const info = await pangaKlient.getPangaInfo();
    console.log(`Panga saldo: ${info.balance}€`);
    return info.balance;
  } catch (error) {
    console.error('Viga saldo vaatamisel:', error.message);
    throw error;
  }
}

// Tee ülekanne
async function saadaRaha(sihtpangaId, summa, kirjeldus = 'Ülekanne') {
  try {
    const tulemus = await pangaKlient.teeYlekanne(sihtpangaId, summa, kirjeldus);
    console.log(`Ülekanne summas ${summa}€ tehtud. Uus saldo: ${tulemus.fromBankBalance}€`);
    return tulemus;
  } catch (error) {
    console.error('Viga ülekande tegemisel:', error.message);
    throw error;
  }
}
```

## 5. Kohandage oma rakendust

Nüüd saate luua täielikult kohandatud panga rakenduse kasutades `PangaKlient` klassi API-ga suhtlemiseks. Siin on mõned ideed:

1. **Kasutajate haldus**: Lisage oma pangale kasutajahaldus, kus iga kasutaja saab luua konto.
2. **Laenud**: Lisage süsteemi laenufunktsioonid, kus kasutajad saavad teistelt pankadelt laenu võtta.
3. **Intress**: Rakendage hoiuste intressiarvestus.
4. **Sularahaautomaat**: Simuleerige sularaha väljavõtmise ja sissemakse funktsioone.
5. **Krediitkaardid**: Lisage krediitkaardi simulatsioon koos krediidilimiidi ja intressiarvestusega.

## 6. Testimine

Testimiseks saate registreerida mitu panka keskpangas ja teha nende vahel ülekandeid.

### Registreerige mitu panka

1. Avage keskpanga liides brauseris (http://localhost:3000)
2. Registreerige mitu panka erinevate nimedega
3. Salvestage iga panga API võti ja ID

### Testige ülekandeid

1. Seadistage iga panga klientrakendus eraldi brauseri vahekaardil
2. Tehke ülekandeid pankade vahel
3. Kontrollige, et bilanss muutuks korrektsel
4. Veenduge, et tehingute ajalugu näitaks kõiki ülekandeid

## 7. Veaotsing

### Server ei käivitu

- Veenduge, et olete paigaldanud kõik sõltuvused käsuga `npm install`
- Kontrollige, et port 3000 oleks vaba
- Vaadake serverilogi võimalike veateadete jaoks

### API ühenduse vead

- Veenduge, et kasutate õiget API võtit ja panga ID-d
- Kontrollige, et keskpanga server töötaks
- Vaadake brauseri konsooli võimalike veateadete jaoks
- Kontrollige, et CORS seaded ei blokeeri päringuid (kui jooksutate erinevatel portidel)

### Ülekanne ebaõnnestub

- Kontrollige, et kontol oleks piisavalt raha
- Veenduge, et kasutate õiget API võtit
- Kontrollige, et sihtpanga ID oleks õige
