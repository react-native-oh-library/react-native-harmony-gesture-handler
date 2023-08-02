import { RNAbility } from 'rnoh/ts';
import { GestureHandlerPackage } from "rnoh-gesture-handler/ts"

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return "pages/Index"
  }

  getBundleURL() {
    return "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"
  }

  createPackages(ctx) {
    return [new GestureHandlerPackage(ctx)]
  }
};

