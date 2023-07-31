import { View } from 'react-native';
import { WebViewProps as _WebViewProps } from 'react-native-webview';

export type WebViewProps = _WebViewProps;

export function WebView(_props: WebViewProps) {
  return <View style={{ width: 64, height: 64, backgroundColor: 'red' }} />;
}

export default WebView;
