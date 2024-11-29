import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Gallery from './Gallery';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Home from './Reel';
import Reel from './Reel';
const {Screen, Navigator} = createStackNavigator();
const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigator initialRouteName="Reel" screenOptions={{headerShown: false}}>
          <Screen name="Home" component={Home} />
          <Screen name="Reel" component={Reel} />
          <Screen name="Gallery" component={Gallery} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
