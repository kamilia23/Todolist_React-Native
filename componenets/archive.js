import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Archive = ({ navigation }) => {
  const [archivedNotes, setArchivedNotes] = useState([]);

  useEffect(() => {
    const fetchArchivedNotes = async () => {
      try {
        const storedArchivedNotes = await AsyncStorage.getItem('archivedNotes');
        if (storedArchivedNotes) {
          setArchivedNotes(JSON.parse(storedArchivedNotes));
        } else {
          setArchivedNotes([]); // Assurez-vous que vous définissez un état initial vide si aucun élément n'est trouvé
        }
      } catch (e) {
        console.error('Error loading archived notes', e);
      }
    };

    fetchArchivedNotes();
    const focusListener = navigation.addListener('focus', fetchArchivedNotes);

    return () => {
      navigation.removeListener('focus', fetchArchivedNotes);
    };
  }, [navigation]);

  const handleRestoreNote = async (note) => {
    const updatedArchivedNotes = archivedNotes.filter((item) => item !== note);
    setArchivedNotes(updatedArchivedNotes);
     await AsyncStorage.setItem('archivedNotes', JSON.stringify(updatedArchivedNotes));

    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = [...notes, note];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Error restoring note', e);
    }
  };

  const handleDeleteNotePermanently = (note) => {
    Alert.alert(
      'Supprimer définitivement',
      'Voulez-vous vraiment supprimer cette note définitivement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: async () => {
            const storedArchivedNotes = archivedNotes.filter((item) => item !== note);
            setArchivedNotes(storedArchivedNotes);
            await storeArchivedNotes(storedArchivedNotes);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const storeArchivedNotes = async (archivedNotesToStore) => {
    try {
      await AsyncStorage.setItem('archivedNotes', JSON.stringify(archivedNotesToStore));
    } catch (e) {
      console.error('Error storing archived notes', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navText}>Notes Archivées</Text>
      </View>
      <FlatList
        data={archivedNotes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteDescription}>{item.description}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleRestoreNote(item)}>
                <FontAwesomeIcon name="undo" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteNotePermanently(item)}>
                <FontAwesomeIcon name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default Archive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 2,
    height: 50,
    marginTop: 25,
    backgroundColor: '#6200ea',
  },
  navItem: {
    padding: 10,
  },
  navText: {
    color: '#ffffff',
    fontSize: 18,
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteDescription: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
