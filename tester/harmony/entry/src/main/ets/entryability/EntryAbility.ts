import { RNAbility } from 'rnoh/ts';

export default class EntryAbility extends RNAbility {
    getPagePath() {
        return "pages/Index"
    }

    getBundleURL() {
        return "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"
    }
};

