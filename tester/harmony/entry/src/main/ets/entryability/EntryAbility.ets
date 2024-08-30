import { RNAbility } from "@rnoh/react-native-openharmony";

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return "pages/Index"
  }

  getRNOHWorkerScriptUrl() {
    return "entry/ets/workers/RNOHWorker.ets"
  }
};
