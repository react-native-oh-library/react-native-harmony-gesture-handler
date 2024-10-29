import {TestCase, TestSuite} from '@rnoh/testerino';
import {
  createNativeWrapper,
  TouchableHighlight,
  enableLegacyWebImplementation,
  enableExperimentalWebImplementation,
  TouchableNativeFeedback,
  Swipeable as MainSwipeable,
  DrawerLayout,
  PureNativeButton,
  RectButton,
  LongPressGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {StyleSheet, Text, View, Platform, Animated} from 'react-native';
import {PALETTE} from '../constants';
import {useState} from 'react';

const RNGHView = createNativeWrapper(View, {
  disallowInterruption: true,
});

const WrappedPureNativeButton = createNativeWrapper(PureNativeButton, {
  shouldActivateOnStart: true,
});

export function SharedAPITest() {
  return (
    <TestSuite name="shared API">
      <TestCase
        itShould="do nothing when calling enableLegacyWebImplementation"
        fn={() => {
          enableLegacyWebImplementation();
        }}
      />
      <TestCase
        itShould="do nothing when calling enableExperimentalWebImplementation"
        fn={() => {
          enableExperimentalWebImplementation();
        }}
      />
      <TestCase
        itShould="pass on press (createNativeWrapper)"
        initialState={false}
        arrange={({setState}) => {
          return (
            <View style={styles.testCaseContainer}>
              <RNGHView
                style={{
                  height: 128,
                  width: 128,
                  backgroundColor: PALETTE.DARK_BLUE,
                  justifyContent: 'center',
                }}
                onBegan={() => {
                  setState(true);
                }}>
                <Text
                  style={{color: 'white', fontSize: 12, textAlign: 'center'}}>
                  PRESS ME
                </Text>
              </RNGHView>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.eq(true);
        }}
      />
      <TestCase
        itShould="change color to red when pressing the button (TouchableHighlight)"
        initialState={false}
        arrange={({setState}) => {
          return (
            <TouchableHighlight
              style={{backgroundColor: PALETTE.DARK_BLUE, paddingVertical: 16}}
              underlayColor={PALETTE.DARK_RED}
              onPress={() => {
                setState(true);
              }}>
              <Text style={{color: 'white', textAlign: 'center'}}>
                PRESS ME
              </Text>
            </TouchableHighlight>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="show ripple effect on press (Android)"
        skip={Platform.OS === 'android' ? false : 'android component'}
        initialState={false}
        arrange={({setState}) => {
          return (
            <>
              <TouchableNativeFeedback
                style={{
                  backgroundColor: PALETTE.DARK_BLUE,
                  paddingVertical: 16,
                }}
                onPress={() => {
                  setState(true);
                }}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  PRESS ME
                </Text>
              </TouchableNativeFeedback>
            </>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="pass when green rectangle is visible after moving the blue rectangle to the right"
        initialState={false}
        arrange={({setState}) => {
          return (
            <Swipeable
              onSwipeableOpen={() => {
                setState(true);
              }}
              renderLeftActions={() => (
                <View
                  style={{
                    backgroundColor: 'green',
                    width: 64,
                    height: 64,
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: 'white', textAlign: 'center'}}>
                    HELLO THERE
                  </Text>
                </View>
              )}>
              <View
                style={{
                  backgroundColor: PALETTE.DARK_BLUE,
                  width: '100%',
                  height: 64,
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  SWIPE ME RIGHT
                </Text>
              </View>
            </Swipeable>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="reexport Swipeable"
        fn={({expect}) => {
          expect(MainSwipeable).is.not.undefined;
        }}
      />
      <TestCase
        itShould="reexport DrawerLayout"
        fn={({expect}) => {
          expect(DrawerLayout).is.not.undefined;
        }}
      />
      <TestCase
        itShould="pass on press (PureNativeButton)"
        initialState={false}
        arrange={({setState}) => {
          return (
            <WrappedPureNativeButton
              onActivated={() => {
                setState(true);
              }}>
              <Text
                style={{
                  backgroundColor: PALETTE.DARK_BLUE,
                  color: 'white',
                  textAlign: 'center',
                  padding: 16,
                }}>
                PRESS ME
              </Text>
            </WrappedPureNativeButton>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="pass when pressed (RectButton) and change color to light red when touched"
        skip={Platform.OS === 'android' ? "doesn't work on Android" : false}
        initialState={false}
        arrange={({setState}) => {
          return (
            <RectButton
              rippleColor={'red'}
              underlayColor="red"
              onPress={() => {
                setState(true);
              }}>
              <View style={{padding: 16}}>
                <Text>List Item 1 - Press me</Text>
              </View>
            </RectButton>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase itShould="emit gesture event when shouldCancelWhenOutside is set to false and pointer is outside LongPressGestureHandler">
        <LongPressGestureHandlerShouldCancelWhenOutsideExample />
      </TestCase>
      <TestCase
        itShould="pass when blue square is pressed"
        initialState={false}
        arrange={({setState}) => {
          return (
            <TapGestureHandler onBegan={() => setState(true)}>
              <Animated.View
                key="progress-indicator"
                style={{
                    left: 0,
                    width: 150,
                    height: 150,
                    backgroundColor: 'green',
                }}>
                <Animated.View
                  style={{
                    height: 100,
                    width: 100,
                    backgroundColor: 'blue',
                    marginLeft: 140,
                  }}
                />
              </Animated.View>
            </TapGestureHandler>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
    </TestSuite>
  );
}

const LongPressGestureHandlerShouldCancelWhenOutsideExample = () => {
  const [state, setState] = useState({x: 0, y: 0});
  return (
    <View>
      <Text>
        x: {state.x}, y: {state.y}
      </Text>
      <LongPressGestureHandler
        maxDist={10000}
        shouldCancelWhenOutside={false}
        onGestureEvent={e => {
          setState({
            x: e.nativeEvent.x,
            y: e.nativeEvent.y,
          });
        }}>
        <View
          style={{
            width: 150,
            height: 128,
            backgroundColor: PALETTE.DARK_BLUE,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
            }}>
            LONG PRESS AND MOVE POINTER OUTSIDE ME
          </Text>
        </View>
      </LongPressGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  testCaseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
