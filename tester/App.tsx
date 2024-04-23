/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';

import {Button, SafeAreaView, ScrollView, StatusBar, View} from 'react-native';
import {Tester} from '@rnoh/testerino';
import {
  GestureHandlerRootView,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';
import {NewApiTest, OldApiTest, SharedAPITest} from './src';

type RootViewMode = 'Component' | 'HOC';

function App({}): JSX.Element | null {
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>('Component');

  return (
    <View style={{flex: 1}}>
      <StatusBar />
      <SafeAreaView style={{backgroundColor: '#222', flex: 1}}>
        <Button
          title={`toggle rootViewMode (current: ${rootViewMode})`}
          onPress={() => {
            setRootViewMode(prev =>
              prev === 'Component' ? 'HOC' : 'Component',
            );
          }}
        />
        {rootViewMode === 'Component' && (
          <GestureHandlerRootView style={{flex: 1}}>
            <Tests />
          </GestureHandlerRootView>
        )}
        {rootViewMode === 'HOC' && <WrappedTests />}
      </SafeAreaView>
    </View>
  );
}

function Tests() {
  return (
    <Tester style={{flex: 1}}>
      <ScrollView style={{width: '100%', flex: 1}}>
        <SharedAPITest />
        <NewApiTest />
        <OldApiTest />
      </ScrollView>
    </Tester>
  );
}

const WrappedTests = gestureHandlerRootHOC(Tests);

export default App;
