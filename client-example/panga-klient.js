/**
 * Panga kliendi näidisrakendus
 * 
 * See fail sisaldab näidist, kuidas õpilased saavad luua oma panga rakenduse,
 * mis suhtleb keskpangaga.
 * 
 * Kasutamiseks:
 * 1. Kopeeri see fail oma projekti
 * 2. Impordi see oma rakenduses
 * 3. Loo uus PangaKlient instants oma API võtmega
 * 4. Kasuta PangaKlient meetodeid oma rakenduses
 */

class PangaKlient {
  /**
   * Loob uue PangaKlient instantsi
   * @param {string} apiKey - Keskpangas registreeritud API võti
   * @param {string} pangaId - Keskpangas registreeritud panga ID
   * @param {string} keskpangaUrl - Keskpanga API URL (vaikimisi http://localhost:3000)
   */
  constructor(apiKey, pangaId, keskpangaUrl = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.pangaId = pangaId;
    this.keskpangaUrl = keskpangaUrl;
  }

  /**
   * Laeb panga info keskpangast
   * @returns {Promise<Object>} Panga info
   */
  async getPangaInfo() {
    try {
      const response = await fetch(`${this.keskpangaUrl}/api/banks/${this.pangaId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga panga info laadimisel');
      }

      return await response.json();
    } catch (error) {
      console.error('Panga info laadimine ebaõnnestus:', error);
      throw error;
    }
  }

  /**
   * Laeb panga tehingute ajaloo
   * @returns {Promise<Array>} Tehingute ajalugu
   */
  async getTehingud() {
    try {
      const response = await fetch(`${this.keskpangaUrl}/api/transactions/bank/${this.pangaId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga tehingute laadimisel');
      }

      return await response.json();
    } catch (error) {
      console.error('Tehingute laadimine ebaõnnestus:', error);
      throw error;
    }
  }

  /**
   * Teeb ülekande teisele pangale
   * @param {string} sihtpangaId - Sihtpanga ID
   * @param {number} summa - Ülekande summa
   * @param {string} kirjeldus - Ülekande kirjeldus
   * @returns {Promise<Object>} Ülekande tulemus
   */
  async teeYlekanne(sihtpangaId, summa, kirjeldus = 'Ülekanne') {
    try {
      if (!sihtpangaId) {
        throw new Error('Sihtpanga ID on kohustuslik');
      }

      if (!summa || isNaN(summa) || summa <= 0) {
        throw new Error('Summa peab olema positiivne arv');
      }

      const response = await fetch(`${this.keskpangaUrl}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          fromBankId: this.pangaId,
          toBankId: sihtpangaId,
          amount: summa,
          description: kirjeldus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga ülekande tegemisel');
      }

      return await response.json();
    } catch (error) {
      console.error('Ülekande tegemine ebaõnnestus:', error);
      throw error;
    }
  }

  /**
   * Laeb kõikide registreeritud pankade nimekirja
   * @returns {Promise<Array>} Pankade nimekiri
   */
  async getPangad() {
    try {
      const response = await fetch(`${this.keskpangaUrl}/api/banks`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Viga pankade nimekirja laadimisel');
      }

      return await response.json();
    } catch (error) {
      console.error('Pankade nimekirja laadimine ebaõnnestus:', error);
      throw error;
    }
  }
}