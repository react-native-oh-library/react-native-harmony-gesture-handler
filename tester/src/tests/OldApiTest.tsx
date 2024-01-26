import {TestCase, TestSuite} from '@rnoh/testerino';
import {forwardRef, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import {PALETTE} from '../constants';

export function OldApiTest() {
  return (
    <TestSuite name="old API">
      <TestCase
        itShould="toggle color on double tap"
        initialState={{
          hasBeenDoubleTapped: false,
          backgroundColor: PALETTE.DARK_BLUE,
        }}
        arrange={({setState, state}) => {
          return (
            <View style={styles.testCaseContainer}>
              <TapGestureHandler
                numberOfTaps={2}
                onActivated={() => {
                  setState({
                    hasBeenDoubleTapped: true,
                    backgroundColor:
                      state.backgroundColor === PALETTE.DARK_BLUE
                        ? PALETTE.LIGHT_GREEN
                        : PALETTE.DARK_BLUE,
                  });
                }}>
                <Rect
                  backgroundColor={state.backgroundColor}
                  label="DOUBLE TAP ME"
                />
                {/* <View
                  style={{
                    width: 128,
                    height: 128,
                    backgroundColor: state.backgroundColor,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{fontSize: 12, color: 'white', textAlign: 'center'}}>
                    {'DOUBLE TAP ME'}
                  </Text>
                </View> */}
              </TapGestureHandler>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state.hasBeenDoubleTapped).to.be.true;
        }}
      />

      <TestCase
        itShould="change color to green when panning after 128px horizontally (panning + activeOffsetX)"
        initialState={{hasPanned: false, backgroundColor: PALETTE.DARK_BLUE}}
        arrange={({setState, state}) => {
          return (
            <View style={styles.testCaseContainer}>
              <PanGestureHandler
                activeOffsetX={[-128, 128]}
                onActivated={() => {
                  setState({
                    hasPanned: true,
                    backgroundColor: PALETTE.LIGHT_GREEN,
                  });
                }}
                onEnded={() => {
                  setState(prev => ({
                    ...prev,
                    backgroundColor: PALETTE.DARK_BLUE,
                  }));
                }}>
                <View
                  style={{
                    width: '100%',
                    height: 128,
                    backgroundColor: state.backgroundColor,
                  }}>
                  <View
                    style={{
                      width: 128,
                      height: 128,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: 'white',
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      PAN ME HORIZONTALLY
                    </Text>
                  </View>
                </View>
              </PanGestureHandler>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state.hasPanned).to.be.true;
        }}
      />

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
      <TestCase itShould="change text when panning on green rect (hit slop)">
        <StateKeeper<string>
          renderContent={(value, setValue) => {
            return (
              <PanGestureHandler
                hitSlop={{right: -64}}
                onActivated={() =>
                  setValue(prev =>
                    prev === 'Panned' ? 'Panned again' : 'Panned',
                  )
                }>
                <View
                  style={{
                    backgroundColor: 'red',
                    width: 128,
                  }}>
                  <Text
                    style={{
                      width: 64,
                      height: 32,
                      borderWidth: 1,
                      fontSize: 12,
                      backgroundColor: 'green',
                    }}>
                    {value ?? 'Pan me'}
                  </Text>
                </View>
              </PanGestureHandler>
            );
          }}
        />
      </TestCase>
      <TestCase itShould="change color when panning left rect but not right">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <StateKeeper<string>
            renderContent={(value, setValue) => {
              return (
                <PanGestureHandler
                  onActivated={() => setValue('green')}
                  onEnded={() => {
                    setValue('red');
                  }}>
                  <View
                    style={{
                      backgroundColor: value ?? 'red',
                      width: 128,
                      height: 64,
                    }}
                  />
                </PanGestureHandler>
              );
            }}
          />
          <StateKeeper<string>
            renderContent={(value, setValue) => {
              return (
                <PanGestureHandler
                  enabled={false}
                  onActivated={() => setValue('green')}
                  onEnded={() => {
                    setValue('red');
                  }}>
                  <View
                    style={{
                      backgroundColor: value ?? 'red',
                      width: 128,
                      height: 64,
                    }}
                  />
                </PanGestureHandler>
              );
            }}
          />
        </View>
      </TestCase>
      <TestCase itShould="change color on tap as long as finger didn't move more than 100px horizontally (maxDeltaX)">
        <StateKeeper<string>
          renderContent={(value, setValue) => {
            return (
              <TapGestureHandler
                maxDeltaX={100}
                onActivated={() =>
                  setValue(prev => (prev === 'red' ? 'green' : 'red'))
                }>
                <View
                  style={{
                    backgroundColor: 'gray',
                    width: 128,
                    height: 64,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      backgroundColor: value ?? 'red',
                      width: 100,
                      height: 64,
                    }}
                  />
                </View>
              </TapGestureHandler>
            );
          }}
        />
      </TestCase>
      <TestCase itShould="scale vertically when dragged horizontally (NativeAnimatedEvent)">
        <NativeAnimatedEventExample />
      </TestCase>
    </TestSuite>
  );
}

const Rect = forwardRef<
  View,
  {
    backgroundColor: string;
    label: string;
  }
>(({backgroundColor, label}, ref) => {
  return (
    <View
      ref={ref}
      style={{
        width: 128,
        height: 128,
        backgroundColor: backgroundColor,
        justifyContent: 'center',
      }}>
      <Text style={{fontSize: 12, color: 'white', textAlign: 'center'}}>
        {label}
      </Text>
    </View>
  );
});

const NativeAnimatedEventExample = () => {
  const animatedValue = useRef(new Animated.Value(100)).current;

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{nativeEvent: {absoluteX: animatedValue}}],
        {useNativeDriver: true},
      )}>
      <Animated.View
        style={{
          backgroundColor: 'red',
          width: 100,
          height: 100,
          alignSelf: 'center',
          transform: [{scaleY: Animated.divide(animatedValue, 100)}],
        }}
      />
    </PanGestureHandler>
  );
};

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

function StateKeeper<T>(props: {
  renderContent: (
    value: T | undefined,
    setValue: React.Dispatch<React.SetStateAction<T | undefined>>,
  ) => void;
}) {
  const [value, setValue] = useState<T>();

  return <>{props.renderContent(value, setValue)}</>;
}

const styles = StyleSheet.create({
  testCaseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
