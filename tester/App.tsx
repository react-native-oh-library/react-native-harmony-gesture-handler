/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {TestCase, TestSuite, Tester} from '@rnoh/testerino';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureType,
} from 'react-native-gesture-handler';

function App({}): JSX.Element {
  return (
    <GestureHandlerRootView>
      <ScrollView style={[styles.container]}>
        <Tester>
          <TestSuite name="react-native-gesture-handler">
            <TestCase itShould="toggle color on tap">
              <TapExample
                createGesture={setBackgroundColor => {
                  return Gesture.Tap().onStart(() => {
                    setBackgroundColor(prev =>
                      prev === 'red' ? 'green' : 'red',
                    );
                  });
                }}
              />
            </TestCase>
            <TestCase itShould="change color to green when panning">
              <TapExample
                createGesture={setBackgroundColor => {
                  return Gesture.Pan()
                    .onStart(() => {
                      setBackgroundColor('green');
                    })
                    .onEnd(() => {
                      setBackgroundColor('red');
                    });
                }}
              />
            </TestCase>
          </TestSuite>
        </Tester>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function TapExample(props: {
  createGesture: (
    setColor: React.Dispatch<React.SetStateAction<string>>,
  ) => GestureType;
}) {
  const [backgroundColor, setBackgroundColor] = useState('red');

  const gesture = React.useMemo(() => {
    return props.createGesture(setBackgroundColor);
  }, []);

  return (
    <GestureDetector gesture={gesture}>
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
