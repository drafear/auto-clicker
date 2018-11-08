import { launch, Browser } from 'puppeteer'
import config from './config'
import * as automation from './automation'

async function main() {
  let browser: (Browser | undefined);
  try {
    browser = await launch({
      headless: false,
      defaultViewport: null as any,
    });
    const page = await browser.newPage();
    await page.goto(config.url);
    await automation.watchKeyInput(page);
    console.log('Auto Clicker was launched!!');
    console.log('Press [Space] key to pause/resume');
    console.log('Press [ESC] key to close');
    await Promise.all([
      automation.autoBake(page, 30),
      automation.autoBuy(page, 500),
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    if (browser !== undefined) await browser.close();
  }
}

main();
