import { Page, ElementHandle } from 'puppeteer';

const suffixTable: {[key: string]: number} = {
  million: Math.pow(10, 6),
  billion: Math.pow(10, 9),
};

function decodeCookies(str: string) {
  str = str.replace(/,/g, '');
  if (!str.includes(' ')) {
    return Number(str);
  }
  const [base, suffix] = str.split(' ');
  return Number(base) * suffixTable[suffix];
}

export async function bake(page: Page) {
  await page.click("#bigCookie");
};

class Product {
  constructor(private elem: ElementHandle<any>) { }

  async owned() {
    const ownedElem = await this.elem.$('.owned');
    if (ownedElem === null) return 0;
    return decodeCookies(await (await ownedElem.getProperty('textContent')).jsonValue());
  }

  async price() {
    const priceElem = await this.elem.$('.price');
    if (priceElem === null) return 0;
    return decodeCookies(await (await priceElem.getProperty('textContent')).jsonValue());
  }

  async buy() {
    await this.elem.click();
  }
}

export async function getProducts(page: Page) {
  const elems = await page.$$('.product:not(.toggledOff)');
  return elems.map(elem => new Product(elem));
}

export class Upgrade {
  constructor(private elem: ElementHandle<any>) { }

  async buy() {
    await this.elem.click();
  }
}

export async function getEnableUpgrades(page: Page) {
  const elems = await page.$$('.upgrade.enabled');
  return elems.map(elem => new Upgrade(elem));
}

export async function getCookies(page: Page) {
  const elem = await page.$('#cookies');
  if (elem === null) return 0;
  const cookiesStr: string = await (await elem.getProperty('textContent')).jsonValue();
  return decodeCookies(cookiesStr.replace(/ cookie.*$/, ''));
}
