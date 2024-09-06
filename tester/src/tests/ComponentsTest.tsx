import {TestCase, TestSuite} from '@rnoh/testerino';
import {
  RectButton,
  BaseButton,
  BorderlessButton,
  ScrollView,
  LongPressGestureHandler,
} from 'react-native-gesture-handler';
import {StyleSheet, Text, View} from 'react-native';
import {PALETTE} from '../constants';

export function ComponentsTest() {
  return (
    <TestSuite name="Components test">
      <TestCase
        itShould="properly handle gestures when wrapped with NativeViewComponentInstance (ScrollView)"
        initialState={false}
        arrange={({setState}) => {
          return (
            <View style={styles.testCaseContainer}>
              <ScrollView>
                <LongPressGestureHandler
                  onHandlerStateChange={({nativeEvent}) => {
                    if (nativeEvent.state === 5 && nativeEvent.duration > 800) {
                      setState(true);
                    }
                  }}
                  minDurationMs={800}>
                  <View style={{
                    width: 200,
                    height: 100,
                    backgroundColor: PALETTE.DARK_BLUE,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: 'white',
                    }}>Long press: 800ms</Text>
                  </View>
                </LongPressGestureHandler>
              </ScrollView>
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.eq(true);
        }}
      />
      <TestCase
        itShould="trigger onPress event for BaseButton"
        initialState={false}
        arrange={({setState}) => {
          return (
            <BaseButton
              onPress={() => setState(true)}
              style={styles.button}>
              <Text>Press me!</Text>
            </BaseButton>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.eq(true);
        }}
      />
      <TestCase
        itShould="trigger onPress event for RectButton"
        initialState={false}
        arrange={({setState}) => {
          return (
            <RectButton
              onPress={() => setState(true)}
              style={styles.button}>
              <Text>Press me!</Text>
            </RectButton>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.eq(true);
        }}
      />
      <TestCase
        itShould="trigger onPress event for BorderlessButton"
        initialState={false}
        arrange={({setState}) => {
          return (
            <BorderlessButton
              onPress={() => setState(true)}
              style={styles.button}>
              <Text>Press me!</Text>
            </BorderlessButton>
          );
        }}
        assert={({expect, state}) => {
          expect(state).to.be.eq(true);
        }}
      />   
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  testCaseContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  button: {
    margin: 20,
    padding: 10,
    backgroundColor: PALETTE.DARK_BLUE,
  },
  buttonText: {
    color: 'white',
  },
});