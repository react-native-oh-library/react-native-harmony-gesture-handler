/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {SafeAreaView, ScrollView, StatusBar, View} from 'react-native';
import {Tester} from '@rnoh/testerino';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NewApiTest, OldApiTest} from './src';

function App({}): JSX.Element | null {
  return (
    <View style={{flex: 1}}>
      <StatusBar />
      <SafeAreaView style={{backgroundColor: '#222', flex: 1}}>
        <GestureHandlerRootView style={{flex: 1}}>
          <Tester style={{flex: 1}}>
            <ScrollView style={{width: '100%', flex: 1}}>
              <NewApiTest />
              <OldApiTest />
            </ScrollView>
          </Tester>
        </GestureHandlerRootView>
      </SafeAreaView>
    </View>
  );
}

export default App;
