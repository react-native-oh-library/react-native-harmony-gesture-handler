import {TestCase, TestSuite} from '@rnoh/testerino';
import React from 'react';
import {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureType,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native-gesture-handler';
import {PALETTE} from '../constants';

export function NewApiTest() {
  return (
    <TestSuite name="new API">
      <TestSuite name="Gesture.LongPress">
        <TestCase
          itShould="pass after pressing the blue rectangle for one second"
          initialState={false}
          arrange={({state, reset, setState}) => {
            const longPressGesture = Gesture.LongPress()
              .minDuration(1000)
              .onStart(() => {
                if (state) {
                  reset();
                } else {
                  setState(true);
                }
              });
            return (
              <GestureDetector gesture={longPressGesture}>
                <View
                  style={{
                    width: '100%',
                    height: 64,
                    backgroundColor: PALETTE.DARK_BLUE,
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: 'white', textAlign: 'center'}}>
                    PRESS ME FOR 1 SEC
                  </Text>
                </View>
              </GestureDetector>
            );
          }}
          assert={({state, expect}) => {
            expect(state).to.be.true;
          }}
        />
      </TestSuite>
      <TestSuite name="Gesture.Manual">
        <TestCase
          itShould="pass after dragging over the blue area (touch down, move, and touch up)"
          initialState={{
            hasTouchedDown: false,
            hasMoved: false,
            hasReleased: false,
          }}
          arrange={({setState}) => {
            const state = {
              hasTouchedDown: false,
              hasMoved: false,
              hasReleased: false,
            };
            const gesture = Gesture.Manual()
              .onTouchesDown(() => {
                state.hasTouchedDown = true;
              })
              .onTouchesMove(() => {
                state.hasMoved = true;
              })
              .onTouchesUp(() => {
                state.hasReleased = true;
                setState(state);
              });

            return (
              <View style={{}}>
                <GestureDetector gesture={gesture}>
                  <View
                    style={[
                      {
                        backgroundColor: PALETTE.DARK_BLUE,
                        width: '100%',
                      },
                    ]}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        paddingVertical: 24,
                      }}>
                      DRAG OVER ME
                    </Text>
                  </View>
                </GestureDetector>
              </View>
            );
          }}
          assert={({expect, state}) => {
            expect(state).to.be.deep.eq({
              hasTouchedDown: true,
              hasMoved: true,
              hasReleased: true,
            });
          }}></TestCase>
      </TestSuite>
      <TestCase
        itShould="toggle color on PINCH"
        initialState={false}
        arrange={({setState}) => {
          return (
            <Example
              label="PINCH ME"
              size={250}
              createGesture={setBackgroundColor => {
                return Gesture.Pinch().onStart(() => {
                  setState(true);
                  setBackgroundColor(prev =>
                    prev === PALETTE.DARK_BLUE
                      ? PALETTE.LIGHT_GREEN
                      : PALETTE.DARK_BLUE,
                  );
                });
              }}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase
        itShould="toggle color on tap"
        initialState={false}
        arrange={({setState}) => {
          return (
            <Example
              label="PRESS ME"
              createGesture={setBackgroundColor => {
                return Gesture.Tap().onStart(() => {
                  setState(true);
                  setBackgroundColor(prev =>
                    prev === PALETTE.DARK_BLUE
                      ? PALETTE.LIGHT_GREEN
                      : PALETTE.DARK_BLUE,
                  );
                });
              }}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />

      <TestCase
        itShould="change color to green when panning"
        initialState={false}
        arrange={({setState}) => {
          return (
            <Example
              label="PAN ME"
              createGesture={setBackgroundColor => {
                return Gesture.Pan()
                  .onStart(() => {
                    setBackgroundColor(PALETTE.LIGHT_GREEN);
                    setState(true);
                  })
                  .onEnd(() => {
                    setBackgroundColor(PALETTE.DARK_BLUE);
                  });
              }}
            />
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />

      <TestCase
        itShould="support TouchableOpacity"
        initialState={false}
        arrange={({setState}) => {
          return (
            <View style={styles.testCaseContainer}>
              <TouchableOpacity
                style={{
                  width: 128,
                  height: 128,
                  backgroundColor: PALETTE.DARK_BLUE,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setState(true);
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'white',
                  }}>
                  PRESS ME
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />

      <TestCase
        itShould="support TouchableWithoutFeedback"
        initialState={false}
        arrange={({setState}) => {
          return (
            <View style={styles.testCaseContainer}>
              <TouchableWithoutFeedback
                style={{
                  width: 128,
                  height: 128,
                  backgroundColor: PALETTE.DARK_BLUE,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setState(true);
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  PRESS ME
                </Text>
              </TouchableWithoutFeedback>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />

      <TestCase
        itShould="display red and green rectangles inside ScrollView (RNGH provides its own ScrollView)"
        modal>
        <ScrollView style={{width: '100%', height: 200}}>
          <View
            style={{
              height: 150,
              backgroundColor: PALETTE.LIGHT_RED,
            }}
          />
          <View
            style={{
              height: 150,
              backgroundColor: PALETTE.LIGHT_GREEN,
            }}
          />
        </ScrollView>
      </TestCase>
    </TestSuite>
  );
}

function Example(props: {
  label: string;
  createGesture: (
    setColor: React.Dispatch<React.SetStateAction<string>>,
  ) => GestureType;
  rightHitSlop?: number;
  size?: number;
}) {
  const [backgroundColor, setBackgroundColor] = useState(PALETTE.DARK_BLUE);

  const gesture = React.useMemo(() => {
    return props.createGesture(setBackgroundColor);
  }, []);

  return (
    <View style={styles.testCaseContainer}>
      <GestureDetector gesture={gesture}>
        <View
          style={{
            width: props.size ?? 128,
            height: props.size ?? 128,
            alignSelf: 'center',
            backgroundColor,
            justifyContent: 'center',
          }}>
          <Text style={{color: 'white', fontSize: 12, textAlign: 'center'}}>
            {props.label}
          </Text>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  testCaseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
