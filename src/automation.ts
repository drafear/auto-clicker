import { Page } from 'puppeteer'
import config from './config'
import * as api from './api'
import { sleep } from './utils'

async function waitForResume(page: Page) {
  await page.waitForFunction('!window.isPausing', { timeout: 0 });
}

async function isHalt(page: Page) {
  return await page.evaluate('window.isHalt');
}

async function buyProducts(page: Page) {
  const money = await api.getCookies(page);
  const products = await api.getProducts(page);
  if (products.length === 0) return;
  let owned: number[] = [];
  for (const product of products) {
    owned.push(await product.owned());
  }
  for (let i = 0; i < products.length; ++i) {
    const product = products[i];
    const price = await product.price();
    if (price > money) continue;
    if (owned[i] >= config.maxOwned) continue;
    if (i + 1 < products.length && owned[i] > owned[i + 1] * 2 + 1) continue;
    product.buy();
    break;
  }
}

async function buyUpgrades(page: Page) {
  const upgrades = await api.getEnableUpgrades(page);
  if (upgrades.length === 0) return;
  await upgrades[0].buy();
}

export async function autoBake(page: Page, interval: number) {
  while (!(await isHalt(page))) {
    await api.bake(page);
    await sleep(interval);
    await waitForResume(page);
  }
}

export async function autoBuy(page: Page, interval: number) {
  while (!(await isHalt(page))) {
    await buyUpgrades(page);
    await buyProducts(page);
    await sleep(interval);
    await waitForResume(page);
  }
}

export async function watchKeyInput(page: Page) {
  let window: any; // for suppressing errors TAT
  await page.evaluate(async () => {
    window.isHalt = false;
    window.isPausing = false;
    await window.addEventListener('keydown', (e: any) => {
      if (e.keyCode === 27) { // ESC
        window.isHalt = true;
      }
      else if (e.keyCode === 32) { // Space
        window.isPausing = !window.isPausing;
      }
    });
  });
}
