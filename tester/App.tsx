/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
// import {Tester} from '@rnoh/testerino';

function App({}): JSX.Element {
  return (
    <ScrollView style={styles.container}>
      {/* <Tester>
        
      </Tester> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default App;
