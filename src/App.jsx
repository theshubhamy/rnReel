import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
const {Screen, Navigator} = createStackNavigator();
const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navigator initialRouteName="Reel" screenOptions={{headerShown: false}}>
          <Screen name="Reel" component={Reel} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
