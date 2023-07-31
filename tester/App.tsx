/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {TestCase, TestSuite, Tester} from '@rnoh/testerino';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

function App({}): JSX.Element {
  return (
    <GestureHandlerRootView>
      <ScrollView style={styles.container}>
        <Tester>
          <TestSuite name="react-native-gesture-handler">
            <TestCase itShould="toggle color on tap">
              <TapExample />
            </TestCase>
          </TestSuite>
        </Tester>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function TapExample() {
  const [backgroundColor, setBackgroundColor] = useState('red');

  const tap = Gesture.Tap().onStart(() => {
    setBackgroundColor(prev => (prev === 'red' ? 'green' : 'red'));
  });

  return (
    <GestureDetector gesture={tap}>
      <View style={{width: 100, height: 32, backgroundColor}} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default App;
