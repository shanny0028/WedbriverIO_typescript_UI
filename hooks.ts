const cucumberJson = require("wdio-cucumberjs-json-reporter");
import { browser } from "@wdio/globals";

export const hooks: Partial<WebdriverIO.Config> = {
  beforeScenario: async (_world) => {
    const scenarioName = _world.pickle.name;
    
    console.log(`Starting scenario: ${scenarioName}`);
  },

  afterStep: async (_step, _world, result) => {
    if (!result.passed) {
      const screenshot = await browser.takeScreenshot();
      await cucumberJson.attach(screenshot, "image/png");
    }
    // await browser.closeWindow()
    // await browser.deleteSession
  },

  after: async () => {
    // Keep session open briefly when explicitly requested for manual debugging.
    if (process.env.KEEP_BROWSER_OPEN === "true") {
      console.log("KEEP_BROWSER_OPEN=true. Delaying teardown for 60 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
  },
};