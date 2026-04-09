import { parseStringPromise } from 'xml2js';

const PELIKAN_FEED_URL = "https://www.pelikan.cz/cs/deal-discount-list.xml?a_aid=levne-letenky";

async function checkProducts() {
  const response = await fetch(PELIKAN_FEED_URL, {
    headers: { "User-Agent": "akcni-letenky.com/1.0" }
  });
  const xmlText = await response.text();
  const parsed = await parseStringPromise(xmlText);
  const wrapper = parsed?.dealDiscountList?.dealDiscounts?.[0];
  const nodes = wrapper?.dealDiscounts || [];
  
  const productNames = new Set();
  const sampleDeals = [];
  
  for (const deal of nodes.slice(0, 20)) {
    const name = deal.dealName?.[0] || '';
    const country = deal.country?.[0] || '';
    const city = deal.city?.[0] || '';
    
    if (deal.dealDiscountProducts?.[0]?.dealDiscountProducts) {
      const products = deal.dealDiscountProducts[0].dealDiscountProducts;
      if (Array.isArray(products)) {
        products.forEach(p => productNames.add(p.name?.[0] || ''));
      }
    }
    
    sampleDeals.push({ name, country, city });
  }
  
  console.log('Product names found:', [...productNames]);
  console.log('\nSample deals:');
  sampleDeals.forEach(d => console.log(` - ${d.name} | ${d.country} | ${d.city}`));
}

checkProducts().catch(console.error);
