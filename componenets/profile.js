import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {

  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (e) {
        console.error('Error loading username', e);
      }
    };

    getUsername();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{ uri: 'https://example.com/your-profile-image-url.jpg' }} // Replace with your profile image URL
        />
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.bio}>Software Engineer at XYZ Company</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <FontAwesomeIcon name="gear" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon name="home" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Notifications')}>
          <FontAwesomeIcon name="bell" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
          <FontAwesomeIcon name="edit" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#6200ea',
    paddingVertical: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  body: {
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default Profile;
