import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Gallery from './Gallery';
import Home from './Reel';
import Reel from './Reel';
const {Screen, Navigator} = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Navigator>
        <Screen name="Home" component={Home} />
        <Screen name="Reel" component={Reel} />
        <Screen name="Gallery" component={Gallery} />
      </Navigator>
    </NavigationContainer>
  );
};

export default App;
