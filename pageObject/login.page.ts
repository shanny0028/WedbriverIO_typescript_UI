import { browser } from '@wdio/globals';
import LoginPageObject from './loginPageObject';
// import {testData} from '../env.config';
import UI from '../library/UIActions';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage extends LoginPageObject {

    public async login(username: string, password: string) {
        await UI.setValue(this.inputUsername, username);
        await UI.setValue(this.inputPassword, password);
        await UI.click(this.btnSubmit);
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    public open () {
        return browser.url('https://parabank.parasoft.com/parabank/index.html');
    }

    public getData () {
    //    console.log(testData.emailOtp);
    }
}

export default new LoginPage();
