import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import LongPressDemo from './demo/shouldCancelWhenOutside';
import GestureDelayedResponse from './demo/GestureDelayedResponse';


AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => LongPressDemo);
AppRegistry.registerComponent(appName, () => GestureDelayedResponse);
