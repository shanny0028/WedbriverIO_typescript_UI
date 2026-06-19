import { $ } from '@wdio/globals'

/**
 * sub page containing specific selectors and methods for a specific page
 */
class SecurePage {
    /**
     * define selectors using getter methods
     */
    public get flashAlert () {
        return $('#flash');
    }
}

export default new SecurePage();
