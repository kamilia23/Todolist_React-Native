
import { StyleSheet } from 'react-native';
import Home from './componenets/home';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Settings from './componenets/setting';
import Profile from './componenets/profile';
import Login from './componenets/login';
import Trash from './componenets/corbeille';
import Archive from './componenets/archive';
import Register from './componenets/Register';
import Splash from './componenets/Splash';
import ForgotPassword from './componenets/ForgotPassword';


const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      
    <Stack.Navigator >
   
      <Stack.Screen name='Register' component={Register} options={{ headerShown: false }}  />
      <Stack.Screen name='Login' component={Login} options={{ headerShown: false }}  />
      <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{ headerShown: false, animation: "slide_from_right" }}
          /> 
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{ headerShown: false }}
          />
      <Stack.Screen name="Home"  options={{ headerShown: false }} component={Home} />
      <Stack.Screen name="Settings"  options={{ headerShown: false }} component={Settings} />
      <Stack.Screen name="Profile"  options={{ headerShown: false }} component={Profile} />
      <Stack.Screen name="Trash"  options={{ headerShown: false }} component={Trash} />
      <Stack.Screen name="Archive"  options={{ headerShown: false }} component={Archive} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
