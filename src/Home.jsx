/* eslint-disable react-native/no-inline-styles */
import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

const Home = ({navigation}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 'auto',
      }}>
      <Text>Home</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
        <Text>Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
