import { ChainablePromiseElement } from 'webdriverio';
import { $, browser } from '@wdio/globals';

class UIActions {
  public async click(selector: string | ChainablePromiseElement): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      // selectorDescription = '[object WebdriverIO.Element]';
      selectorDescription = (selector as any).selector ?? '[object WebdriverIO.Element]';
    }
    try {
      await element.waitForExist();
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      await element.waitForClickable();
      // scroll to center
      await element.click();
    } catch (error) {
      throw new Error(
        `Failed to click element "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  public async setValue(
    selector: string | ChainablePromiseElement,
    value: string | number,
  ): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = (selector as any).selector ?? '[object WebdriverIO.Element]';
    }

    try {
      // Validate value is not undefined or null
      if (value === undefined || value === null) {
        throw new Error(`Value cannot be undefined or null`);
      }

      await element.waitForExist();
      
      await element.waitForDisplayed();
      await element.waitForEnabled();
      await element.scrollIntoView({ block: 'center', inline: 'center' });

      // Convert value to string for setValue
      const stringValue = String(value);
      await element.clearValue();
      await element.setValue(stringValue);
    } catch (error) {
      throw new Error(
        `Failed to set value "${value}" in element "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  public async getText(selector: string | ChainablePromiseElement): Promise<string> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }

    try {
      // await element.waitForExist({ timeout: 5000 });
      await element.waitForDisplayed();
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      return await element.getText();
    } catch (error) {
      throw new Error(
        `Failed to get text from element "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  public async checkElementIsDisabledButVisible(
    selector: string | ChainablePromiseElement,
  ): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }

    try {
      await element.waitForExist();
      await element.waitForDisplayed();

      const isDisabled = (await element.getAttribute('disabled')) !== null;
      const isClickable = await element.isClickable();

      if (!isDisabled) {
        throw new Error(`❌ Element "${selectorDescription}" is not disabled.`);
      }

      if (isClickable) {
        throw new Error(`❌ Element "${selectorDescription}" is clickable, but it should not be.`);
      }

      console.log(
        `✅ Element "${selectorDescription}" is visible, disabled, and not clickable as expected.`,
      );
    } catch (error) {
      throw new Error(
        `Failed to verify disabled state for "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  public async getValue(selector: string | ChainablePromiseElement): Promise<string> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }

    try {
      await element.waitForExist();
      await element.waitForDisplayed();
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      return await element.getValue();
    } catch (error) {
      throw new Error(
        `Failed to get value from input element "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  public async waitForSeconds(seconds: number): Promise<void> {
    const milliseconds = seconds * 1000;
    await browser.pause(milliseconds);
  }
  // Sometimes get text will return text in multiple lines,so this method will return you text in single line
  public normalizeMultilineText(text: string): string {
    return text.replace(/\s*\n\s*/g, ' ').trim();
  }

  public async waitForElementDisplayed(
    selector: string | ChainablePromiseElement,
    timeout = 30000,
  ): Promise<ChainablePromiseElement> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }

    try {
      await element.waitForExist();
      await element.waitForDisplayed();
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      return element;
    } catch (error) {
      throw new Error(
        `Element "${selectorDescription}" was not displayed within ${timeout}ms: ${(error as Error).message}`,
      );
    }
  }

  public async waitForPageLoadComplete(timeout = 40000): Promise<void> {
    await browser.waitUntil(
      async () => {
        const state = await browser.execute(() => document.readyState);
        return state === 'complete';
      },
      {
        timeout,
        timeoutMsg: 'Page did not load within the specified timeout',
      },
     
    );
  }

  public async refreshPage(): Promise<void> {
    await browser.refresh();
  }

  /**
   * Waits for an element to be displayed with polling every 2 seconds.
   * @param element WebdriverIO element to wait for
   * @param timeout Maximum time to wait in milliseconds (default: 40000)
   * @param interval Polling interval in milliseconds (default: 2000)
   */
  public async waitForDisplayedWithPolling(
    element: ChainablePromiseElement,
    timeout = 40000,
    interval = 2000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await element.isDisplayed()) {
          return;
        }
      } catch (err) {
        console.log(`Element is not displayed even after ${timeout} ms`, err);
        // Element might not be in the DOM yet — ignore and retry
      }

      await browser.pause(interval);
    }

    throw new Error(`Element was not displayed after ${timeout} ms`);
  }

  /** This method is specific to Salesforce dropdown element value selection*/
  public async selectValue(
    dropdownSelector: string | ChainablePromiseElement,
    optionSelector: string | ChainablePromiseElement,
  ): Promise<void> {
    let dropdownElement: ChainablePromiseElement;
    let dropdownDescription: string;
    let optionElement: ChainablePromiseElement;
    let optionDescription: string;

    if (typeof dropdownSelector === 'string') {
      dropdownElement = $(dropdownSelector);
      dropdownDescription = dropdownSelector;
    } else {
      dropdownElement = dropdownSelector;
      dropdownDescription = '[object WebdriverIO.Element]';
    }

    if (typeof optionSelector === 'string') {
      optionElement = $(optionSelector);
      optionDescription = optionSelector;
    } else {
      optionElement = optionSelector;
      optionDescription = '[object WebdriverIO.Element]';
    }

    try {
      // Open dropdown quickly and wait for the option to appear using polling
      await dropdownElement.waitForClickable({ timeout: 5000 });
      await dropdownElement.scrollIntoView({ block: 'center', inline: 'center' });
      await dropdownElement.click();

      // Wait until the option exists and is displayed (polling) — faster and less brittle than fixed sleeps
      const optionTimeout = 8000;
      await browser.waitUntil(
        async () => {
          try {
            return (await optionElement.isExisting()) && (await optionElement.isDisplayed());
          } catch (e) {
            console.log(`Option "${optionDescription}" not yet available: ${e.message}`);
            return false;
          }
        },
        {
          timeout: optionTimeout,
          timeoutMsg: `Option "${optionDescription}" did not appear within ${optionTimeout}ms`,
        },
      );

      // Try normal click first; if it fails, fall back to JS click
      try {
        await optionElement.waitForClickable({ timeout: 2000 });
        await optionElement.scrollIntoView({ block: 'center', inline: 'center' });
        await optionElement.click();
      } catch {
        // Fallback: perform a JS click which is usually faster and bypasses some clickability checks
        console.log(`Normal click failed for option "${optionDescription}", attempting JS click: ${clickErr.message}`);
        await browser.execute((el: HTMLElement) => el.click(), optionElement);
      }

      console.log(`${optionDescription} selected from dropdown ${dropdownDescription}`);
    } catch (error) {
      throw new Error(
        `Failed to select option "${optionDescription}" from dropdown "${dropdownDescription}": ${(error as Error).message}`,
      );
    }
  }

  /**
   * Verifies the visibility of an element.
   * @param selector - The selector string or ChainablePromiseElement representing the element.
   * @param shouldBeVisible - Boolean indicating whether the element should be visible.
   */
  public async verifyElementVisibility(
    selector: string | ChainablePromiseElement,
    shouldBeVisible: boolean,
  ): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }

    try {
      const isDisplayed = await element.isDisplayed();

      if (isDisplayed !== shouldBeVisible) {
        const visibilityState = shouldBeVisible ? 'visible' : 'not visible';
        throw new Error(
          `[${this.constructor.name}] Element "${selectorDescription}" visibility mismatch. Expected: ${visibilityState}, Actual: ${isDisplayed}`,
        );
      }

      console.log(
        `✅ [${this.constructor.name}] Element "${selectorDescription}" visibility verified as ${shouldBeVisible ? 'visible' : 'not visible'}.`,
      );
    } catch (error) {
      console.error(
        `[${this.constructor.name}] Error verifying element visibility: ${error.message}`,
      );
      throw new Error(
        `[${this.constructor.name}] Failed to verify element visibility: ${error.message}`,
      );
    }
  }

  /**
   * Click on button using js script executor , sometimes normal click wont work in salesforce to tacke this we have to use below method
   * @param selector - The selector string or ChainablePromiseElement representing the element.
   * @param shouldBeVisible - Boolean indicating whether the element should be visible.
   */

  public async jsClick(selector: string | ChainablePromiseElement): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = (selector as any).selector ?? '[object WebdriverIO.Element]';
    }

    try {
      await element.waitForExist();
      await element.scrollIntoView({ block: 'center', inline: 'center' });

      // Perform JavaScript click
      await browser.execute((el: HTMLElement) => el.click(), await element);
    } catch (error) {
      throw new Error(
        `JavaScript click failed for element "${selectorDescription}": ${(error as Error).message}`,
      );
    }
  }

  /**
   * Validates if a checkbox element is enabled or disabled
   * @param checkboxElement - The checkbox element to validate
   * @param expectedState - true if checkbox should be enabled, false if disabled
   */
  public async validateCheckboxState(checkboxElement: ChainablePromiseElement, expectedState: boolean): Promise<void> {
    try {
      await this.waitForElementDisplayed(checkboxElement);
      const isEnabled = await checkboxElement.isEnabled();

      if (isEnabled !== expectedState) {
        throw new Error(`Checkbox is ${isEnabled ? 'enabled' : 'disabled'} but expected to be ${expectedState ? 'enabled' : 'disabled'}`);
      }

      console.log(`✅ Checkbox is correctly ${expectedState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.log(`❌ Error validating checkbox state: ${error.message}`);
      throw new Error(`Failed to validate checkbox state: ${error.message}`);
    }
  }


  public async waitForElementNotDisplayed(
    selector: string | ChainablePromiseElement,
    timeout = 5000,
  ): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;

    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = '[object WebdriverIO.Element]';
    }
    const browserName = browser.capabilities.browserName;
    try {
      await browser.waitUntil(async () => !(await element.isDisplayed()), {
        timeout,
        timeoutMsg: `Element "${selectorDescription}" was still displayed after ${timeout}ms`,
      });
    } catch (error) {
      throw new Error(
        `Element "${selectorDescription}" was still displayed after ${timeout}ms: ${(error as Error).message}`,
      );
    }
  }


  public async clearValue(
    selector: string | ChainablePromiseElement
  ): Promise<void> {
    let element: ChainablePromiseElement;
    let selectorDescription: string;
  
    if (typeof selector === 'string') {
      element = $(selector);
      selectorDescription = selector;
    } else {
      element = selector;
      selectorDescription = (selector as any).selector ?? '[object WebdriverIO.Element]';
    }
  
    try {
      await element.waitForDisplayed();
      await element.scrollIntoView({ block: 'center', inline: 'center' });
  
      // Try native clearValue first
      await element.clearValue();
  
      let currentValue;
      // Use browser.execute to clear value and trigger input event
       currentValue = await element.getValue();
      
      if (!currentValue || currentValue.trim() === '') {
        currentValue = await element.getAttribute('value');
      }

      await element.click();
      for (let i = 0; i < currentValue.length; i++) {
        await browser.keys(['Backspace'])
      }


    } catch (error) {
      throw new Error(
        `Failed to clear value in element "${selectorDescription}": ${(error as Error).message}`
      );
    }
  }

  public async verifyElementAvailability(
    selector: string | ChainablePromiseElement,
    shouldExist: boolean,
  ): Promise<void> {
    const element =
      typeof selector === 'string' ? $(selector) : selector;

    const selectorDescription =
      typeof selector === 'string' ? selector : '[WebdriverIO.Element]';

    try {
      const exists = await element.isExisting();

      if (exists !== shouldExist) {
        throw new Error(
          `Availability mismatch for "${selectorDescription}". Expected: ${shouldExist}, Actual: ${exists}`
        );
      }

      console.log(
        `✅ Element "${selectorDescription}" availability verified as ${shouldExist}`
      );
    } catch (error: any) {
      console.error(
        `[${this.constructor.name}] Error verifying element availability: ${error.message}`
      );
      throw new Error(
        `[${this.constructor.name}] Failed to verify element availability: ${error.message}`
      );
    }
  }
}

export default new UIActions();
