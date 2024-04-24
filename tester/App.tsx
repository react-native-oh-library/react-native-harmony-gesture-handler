/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useRef, useState} from 'react';

import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';

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
  const drawerLayoutRef = useRef<DrawerLayout>(null);
  const [drawerState, setDrawerState] = useState<
    'OPEN' | 'CLOSED' | 'CHANGING'
  >('CLOSED');

  const onRenderNavigationView = useCallback(() => {
    return (
      <View>
        <Text>DrawerLayout isn't super responsive on Android</Text>
      </View>
    );
  }, []);

  return (
    <>
      <Button
        title={`Toggle Drawer (${drawerState})`}
        onPress={() => {
          const drawer = drawerLayoutRef.current;
          if (drawer) {
            drawer.state.drawerOpened
              ? drawer.closeDrawer()
              : drawer.openDrawer();
          }
        }}
      />
      <Tester style={{flex: 1}}>
        <DrawerLayout
          ref={drawerLayoutRef}
          useNativeAnimations
          drawerWidth={200}
          drawerPosition={'left'}
          drawerType="slide"
          drawerBackgroundColor="#ddd"
          renderNavigationView={onRenderNavigationView}
          onDrawerOpen={() => {
            setDrawerState('OPEN');
          }}
          onDrawerSlide={() => {
            setDrawerState('CHANGING');
          }}
          onDrawerClose={() => {
            setDrawerState('CLOSED');
          }}>
          <ScrollView style={{width: '100%', flex: 1}}>
            <SharedAPITest />
            <NewApiTest />
            <OldApiTest />
          </ScrollView>
        </DrawerLayout>
      </Tester>
    </>
  );
}

const WrappedTests = gestureHandlerRootHOC(Tests);

export default App;
