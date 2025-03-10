# Keskpanga API Dokumentatsioon

See dokument kirjeldab üksikasjalikult kuidas õpilased saavad integreerida oma panga rakenduse keskpanga API-ga.

## Ülevaade

Keskpanga API võimaldab õpilastel:

1. Registreerida oma pank keskpangas
2. Teha ülekandeid teistele registreeritud pankadele
3. Vaadata konto jääki ja tehingute ajalugu

## API URL

Keskpanga API on saadaval järgmisel aadressil (eeldusel, et server töötab kohalikul masinal pordil 3000):

```
http://localhost:3000/api
```

## Swagger UI

API testimiseks ja uurimiseks on saadaval interaktiivne Swagger UI liides:

```
http://localhost:3000/api-docs
```

Swagger UI võimaldab:
- Näha kõiki API otspunkte (endpoints)
- Testida päringuid otse veebiliideses
- Vaadata API päringute ja vastuste mudeleid
- Lugeda dokumentatsiooni iga API otspunkti kohta

## Autentimine

Enamus API päringuid nõuavad autentimist, mis toimub `X-API-Key` päise abil. API võti antakse pangale registreerimise ajal.

Näide:
```
X-API-Key: sinu-api-voti
```

Swagger UI keskkond võimaldab API võtme lisada päringu autoriseerimisel, vajutades "Authorize" nupule.

## API Endpoints

### 1. Panga registreerimine

**Endpoint:** `POST /api/banks/register`

**Autentimine:** Ei ole vajalik

**Päring:**
```json
{
  "name": "Panga nimi",
  "apiUrl": "https://panga-api-url.com"
}
```

**Eduka vastuse näide (201 Created):**
```json
{
  "id": "panga-id",
  "name": "Panga nimi",
  "apiKey": "genereeritud-api-voti",
  "balance": 1000
}
```

**NB!** Hoidke tagastatud API võti kindlas kohas, seda on vaja edaspidiseks autentimiseks.

### 2. Pankade nimekiri

**Endpoint:** `GET /api/banks`

**Autentimine:** Ei ole vajalik

**Eduka vastuse näide (200 OK):**
```json
[
  {
    "id": "panga-id-1",
    "name": "Panga nimi 1",
    "balance": 1000
  },
  {
    "id": "panga-id-2",
    "name": "Panga nimi 2",
    "balance": 2500
  }
]
```

### 3. Panga info

**Endpoint:** `GET /api/banks/:id`

**Autentimine:** Vajalik (`X-API-Key` päis)

**Eduka vastuse näide (200 OK):**
```json
{
  "id": "panga-id",
  "name": "Panga nimi",
  "balance": 1000
}
```

### 4. Ülekanne

**Endpoint:** `POST /api/transactions`

**Autentimine:** Vajalik (`X-API-Key` päis, peab olema lähtekoha panga API võti)

**Päring:**
```json
{
  "fromBankId": "lahtepanga-id",
  "toBankId": "sihtpanga-id",
  "amount": 100,
  "description": "Ülekande kirjeldus"
}
```

**Eduka vastuse näide (201 Created):**
```json
{
  "transaction": {
    "id": "ulekande-id",
    "fromBankId": "lahtepanga-id",
    "fromBankName": "Lähtepanga nimi",
    "toBankId": "sihtpanga-id",
    "toBankName": "Sihtpanga nimi",
    "amount": 100,
    "description": "Ülekande kirjeldus",
    "timestamp": "2025-03-10T12:00:00Z"
  },
  "fromBankBalance": 900
}
```

### 5. Kõik ülekanded

**Endpoint:** `GET /api/transactions`

**Autentimine:** Ei ole vajalik

**Eduka vastuse näide (200 OK):**
```json
[
  {
    "id": "ulekande-id-1",
    "fromBankId": "panga-id-1",
    "fromBankName": "Pank 1",
    "toBankId": "panga-id-2",
    "toBankName": "Pank 2",
    "amount": 100,
    "description": "Ülekanne 1",
    "timestamp": "2025-03-10T12:00:00Z"
  },
  {
    "id": "ulekande-id-2",
    "fromBankId": "panga-id-2",
    "fromBankName": "Pank 2",
    "toBankId": "panga-id-1",
    "toBankName": "Pank 1",
    "amount": 50,
    "description": "Ülekanne 2",
    "timestamp": "2025-03-10T12:30:00Z"
  }
]
```

### 6. Panga ülekanded

**Endpoint:** `GET /api/transactions/bank/:bankId`

**Autentimine:** Vajalik (`X-API-Key` päis, peab olema vastava panga API võti)

**Eduka vastuse näide (200 OK):**
```json
[
  {
    "id": "ulekande-id-1",
    "fromBankId": "panga-id",
    "fromBankName": "Minu Pank",
    "toBankId": "teise-panga-id",
    "toBankName": "Teine Pank",
    "amount": 100,
    "description": "Väljaminev makse",
    "timestamp": "2025-03-10T12:00:00Z"
  },
  {
    "id": "ulekande-id-2",
    "fromBankId": "kolmanda-panga-id",
    "fromBankName": "Kolmas Pank",
    "toBankId": "panga-id",
    "toBankName": "Minu Pank",
    "amount": 200,
    "description": "Sisenev makse",
    "timestamp": "2025-03-10T13:00:00Z"
  }
]
```

## Veakoodid

- **400 Bad Request** - Vale päringusüntaks või parameetrid
- **401 Unauthorized** - API võti puudub
- **403 Forbidden** - Vale API võti või ei ole õigusi toimingu tegemiseks
- **404 Not Found** - Panka või ressurssi ei leitud
- **500 Internal Server Error** - Serveri siseviga

## Integreerimine

Õpilaste käsutuses on kaks viisi keskpangaga integreerumiseks:

### 1. Otse API pöördumised

Õpilased võivad teha otse HTTP päringuid API-le, kasutades oma valitud tehnoloogiat (fetch, axios, jne).

### 2. Kliendi teegi kasutamine

Keskpank pakub ka JavaScripti kliendi teeki, mis lihtsustab API-ga suhtlemist.

Teek on kaasas näidisrakendusega (`client-example/panga-klient.js`).

Näide:

```javascript
// Impordi kliendi teek
// import { PangaKlient } from './panga-klient.js'; // Mooduli impordina

// Loo uus panga klient
const pangaKlient = new PangaKlient(
  'sinu-api-voti',
  'sinu-panga-id',
  'http://localhost:3000' // Keskpanga URL
);

// Vaata panga infot
async function vaataPangaInfo() {
  try {
    const info = await pangaKlient.getPangaInfo();
    console.log('Panga info:', info);
  } catch (error) {
    console.error('Viga:', error.message);
  }
}

// Tee ülekanne
async function teeYlekanne() {
  try {
    const tulemus = await pangaKlient.teeYlekanne(
      'sihtpanga-id',
      100, // Summa
      'Ülekande kirjeldus'
    );
    console.log('Ülekanne tehtud:', tulemus);
  } catch (error) {
    console.error('Viga:', error.message);
  }
}
```

## Soovitused

1. **Turvalisus** - Hoidke oma API võtit turvalises kohas ja ärge jätke seda avalikku koodi.
2. **Veahaldus** - Käsitlege kõiki võimalikke vigu korrektselt ja näidake kasutajale selgeid veateateid.
3. **Automaatne värskendamine** - Kaaluge konto jäägi ja tehingute ajaloo automaatset värskendamist regulaarsete intervallidega.
4. **API testimine** - Kasutage Swagger UI-d API päringute testimiseks ja erinevate parameetrite mõju uurimiseks.