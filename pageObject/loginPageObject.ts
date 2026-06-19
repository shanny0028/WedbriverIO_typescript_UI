import { $ } from '@wdio/globals';

/**
 * Base login page object with reusable selectors and actions.
 */
export default class LoginPageObject {
  public get inputUsername() {
    return $('//input[@name="username"]');
  }

  public get inputPassword() {
    return $('//input[@name="password"]');
  }

  public get btnSubmit() {
    return $('//button[@type="submit"]');
  }
}
