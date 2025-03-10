# Keskpank

Keskpanga rakendus õppetöö jaoks, mis võimaldab õpilastel oma panga rakenduste kaudu üksteisele ülekandeid teha.

## Paigaldamine

1. Klooni repositoorium
```
git clone https://github.com/JoonasMagi/pank.git
cd pank
```

2. Paigalda sõltuvused
```
npm install
```

3. Käivita server
```
npm start
```

Server käivitub pordil 3000.

## Rakenduse kasutamine

### Keskpank

Keskpanga veebiliides on kättesaadav aadressil [http://localhost:3000](http://localhost:3000)

### Swagger UI

API dokumentatsioon Swagger UI abil on kättesaadav aadressil [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Swagger UI võimaldab:
- Uurida kõiki saadaolevaid API endpoint-e
- Testida API päringuid otse veebiliideses
- Vaadata API vastuste mudeleid
- Tutvuda API dokumentatsiooniga

### Klientrakenduse näidis

Kliendi näidisrakendus asub 'client-example' kataloogis. Seda saab kasutada malli põhjal oma panga rakenduse loomiseks.

## API dokumentatsioon

Täpsem API dokumentatsioon on saadaval:
- Swagger UI kaudu: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (kui server on käivitatud)
- Dokumentatsiooni failina: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Õpetusena: [docs/TUTORIAL.md](docs/TUTORIAL.md)

## Funktsioonid

### Keskpank

- Pankade registreerimine ja haldamine
- Ülekannete tegemine pankade vahel
- Kontosaldode jälgimine
- Tehingute ajaloo kuvamine
- API dokumentatsioon Swagger UI abil

### Panga kliendi näidisrakendus

- Panga seadistamine API võtme ja ID abil
- Konto saldo vaatamine
- Ülekannete tegemine teistele pankadele
- Tehingute ajaloo kuvamine

## Projekti struktuur

- **server.js** - Express.js server, mis käitleb kõiki API päringuid
- **package.json** - Projekti sõltuvused ja käivitamisskriptid
- **data/** - JSON andmebaasid pankade ja ülekannete jaoks
  - **banks.json** - Pankade andmed
  - **transactions.json** - Ülekannete ajalugu
- **public/** - Staatilised failid veebiliidese jaoks
  - **index.html** - Keskpanga veebiliidese pealeht
  - **script.js** - Keskpanga veebiliidese JavaScript
  - **style.css** - Keskpanga veebiliidese CSS
- **client-example/** - Klientpanga näidisrakendus
  - **index.html** - Kliendi näidisrakenduse HTML
  - **app.js** - Kliendi näidisrakenduse JavaScript
  - **panga-klient.js** - Teek keskpanga API-ga suhtlemiseks
- **docs/** - Dokumentatsioon
  - **API_DOCUMENTATION.md** - Üksikasjalik API dokumentatsioon
  - **TUTORIAL.md** - Õpetus süsteemi kasutamiseks

## Litsents

MIT
