import React from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import {Tester} from '@rnoh/testerino';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NewApiTest, OldApiTest} from './src';

function App({}): JSX.Element | null {
  return (
    <SafeAreaView style={{backgroundColor: '#222'}}>
      <GestureHandlerRootView>
        <ScrollView style={{width: '100%', height: '100%'}}>
          <Tester>
            <NewApiTest />
            <OldApiTest />
          </Tester>
        </ScrollView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

export default App;
