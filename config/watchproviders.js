const puppeteer = require('puppeteer');

/**
 * Método para extraer datos de JustWatch desde una URL dada.
 * @param {string} url - URL base para la extracción.
 * @returns {Promise<Array>} - Lista de enlaces limpios con sus respectivas calidades y tipos.
 */
async function extractJustWatchLinks(url) {
  const fullUrl = `${url}&translate=true&language=es-MX`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
      const data = [];

      const providers = document.querySelectorAll('.providers li');

      providers.forEach(provider => {
        const qualityClasses = Array.from(provider.classList).filter(cls => cls.startsWith('ott_filter_'));
        let qualities = qualityClasses.map(cls => cls.replace('ott_filter_', ''));

        const linkElement = provider.querySelector('a');
        if (linkElement) {
          let rawLink = linkElement.href;
          const titleText = linkElement.title || linkElement.textContent.trim() || 'No title';

          // Limpieza del título para obtener solo el nombre del proveedor
          const providerName = titleText.replace(/(Ver|Alquilar|Comprar).+en\s+/i, '').trim();

          // Filtrado de calidad para eliminar 'best_price' y dejar el resto
          const type = qualities.includes('best_price') ? 'rent' : 'flatrate';
          qualities = qualities.filter(q => q !== 'best_price');

          // Extracción de la URL limpia
          let cleanLink = rawLink.replace(/&amp;/g, '&');
          const match = cleanLink.match(/&r=(https%3A%2F%2F.+?)(&|$)/);
          if (match && match[1]) {
            cleanLink = decodeURIComponent(match[1]);
          } else {
            console.warn('No se encontró una URL válida en:', rawLink);
          }

          // Añadiendo al resultado
          data.push({
            link: cleanLink,
            title: providerName,
            qualities: qualities.length > 0 ? qualities[0] : null,
            type,
          });
        }
      });

      return data;
    });

    return result;
  } catch (error) {
    console.error('Error durante la extracción:', error);
    return [];
  } finally {
    await browser.close();
  }
}


module.exports = extractJustWatchLinks;
