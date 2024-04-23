import {TestCase, TestSuite} from '@rnoh/testerino';
import {
  enableLegacyWebImplementation,
  enableExperimentalWebImplementation,
} from 'react-native-gesture-handler';
import {createNativeWrapper} from 'react-native-gesture-handler';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {PALETTE} from '../constants';

const RNGHView = createNativeWrapper(View, {
  disallowInterruption: true,
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
});
