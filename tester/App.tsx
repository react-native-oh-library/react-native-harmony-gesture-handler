/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {TestCase, TestSuite, Tester} from '@rnoh/testerino';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureType,
  PanGestureHandler,
  State,
  TapGestureHandler,
  TouchableOpacity,
} from 'react-native-gesture-handler';

function App({}): JSX.Element {
  return (
    <GestureHandlerRootView>
      <ScrollView style={[styles.container]}>
        <Tester>
          <TestSuite name="react-native-gesture-handler">
            <TestCase itShould="toggle color on tap">
              <Example
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
              <Example
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
            <TestCase itShould="export TouchableOpacity">
              <TouchableOpacity>
                <Text
                  style={{
                    width: 256,
                    height: 32,
                    borderWidth: 1,
                    fontSize: 12,
                  }}>
                  Touchable Opacity content
                </Text>
              </TouchableOpacity>
            </TestCase>
          </TestSuite>
          <TestSuite name="old API">
            <TestCase itShould="toggle color on double tap">
              <TapExample />
            </TestCase>
            <TestCase itShould="change color to green when panning after 50 px in X direction">
              <PanningExample />
            </TestCase>
            <TestCase itShould="display event received by onGestureEvent when dragging over blue rectangle">
              <ObjectDisplayer
                renderContent={setObject => {
                  return (
                    <PanGestureHandler
                      onGestureEvent={e => {
                        setObject({
                          absoluteX: e.nativeEvent.absoluteX,
                          absoluteY: e.nativeEvent.absoluteY,
                          handlerTag: e.nativeEvent.handlerTag,
                          numberOfPointers: e.nativeEvent.numberOfPointers,
                          state: e.nativeEvent.state,
                          translationX: e.nativeEvent.translationX,
                          translationY: e.nativeEvent.translationY,
                          velocityX: e.nativeEvent.velocityX,
                          velocityY: e.nativeEvent.velocityY,
                          x: e.nativeEvent.x,
                          y: e.nativeEvent.y,
                        });
                      }}>
                      <View
                        style={{
                          width: 100,
                          height: 32,
                          backgroundColor: 'blue',
                        }}
                      />
                    </PanGestureHandler>
                  );
                }}
              />
            </TestCase>
            <TestCase itShould="display event received by onHandlerStateChange when dragging over blue rectangle">
              <ObjectDisplayer
                renderContent={setObject => {
                  return (
                    <PanGestureHandler
                      onHandlerStateChange={e => {
                        setObject({
                          oldState: e.nativeEvent.oldState,
                          state: e.nativeEvent.state,
                          absoluteX: e.nativeEvent.absoluteX,
                          absoluteY: e.nativeEvent.absoluteY,
                          handlerTag: e.nativeEvent.handlerTag,
                          numberOfPointers: e.nativeEvent.numberOfPointers,
                          translationX: e.nativeEvent.translationX,
                          translationY: e.nativeEvent.translationY,
                          velocityX: e.nativeEvent.velocityX,
                          velocityY: e.nativeEvent.velocityY,
                          x: e.nativeEvent.x,
                          y: e.nativeEvent.y,
                        });
                      }}>
                      <View
                        style={{
                          width: 100,
                          height: 32,
                          backgroundColor: 'blue',
                        }}
                      />
                    </PanGestureHandler>
                  );
                }}
              />
            </TestCase>
            <TestCase
              itShould="export State object"
              fn={({expect}) => {
                expect(State).to.be.not.undefined;
              }}
            />
          </TestSuite>
        </Tester>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function Example(props: {
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

function TapExample() {
  const [backgroundColor, setBackgroundColor] = useState('red');

  return (
    <TapGestureHandler
      numberOfTaps={2}
      onActivated={() => {
        setBackgroundColor(prev => (prev === 'red' ? 'green' : 'red'));
      }}>
      <View style={{width: 100, height: 32, backgroundColor}} />
    </TapGestureHandler>
  );
}

function PanningExample() {
  const [backgroundColor, setBackgroundColor] = useState('red');

  return (
    <PanGestureHandler
      activeOffsetX={[-50, 50]}
      onActivated={() => {
        setBackgroundColor('green');
      }}
      onEnded={() => setBackgroundColor('red')}>
      <View style={{width: 100, height: 32, backgroundColor}} />
    </PanGestureHandler>
  );
}

function ObjectDisplayer(props: {
  renderContent: (setObject: (obj: Object) => void) => any;
}) {
  const [object, setObject] = useState<Object>();

  return (
    <View style={{width: 256, height: 200}}>
      <Text
        style={{width: 256, height: 128, fontSize: 8, backgroundColor: '#EEE'}}>
        {object === undefined ? 'undefined' : JSON.stringify(object)}
      </Text>
      {props.renderContent(setObject)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default App;
