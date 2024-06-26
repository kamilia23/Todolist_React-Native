import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Trash = ({ navigation }) => {
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  useEffect(() => {
    const fetchDeletedNotes = async () => {
      try {
        const storedDeletedNotes = await AsyncStorage.getItem('deletedNotes');
        if (storedDeletedNotes) {
          setDeletedNotes(JSON.parse(storedDeletedNotes));
        }
      } catch (e) {
        console.error('Error loading deleted notes', e);
      }
    };

    fetchDeletedNotes();
  }, []);

  const storeDeletedNotes = async (deletedNotesToStore) => {
    try {
      await AsyncStorage.setItem('deletedNotes', JSON.stringify(deletedNotesToStore));
    } catch (e) {
      console.error('Error storing deleted notes', e);
    }
  };

  const handleRestoreNote = async (note) => {
    const updatedDeletedNotes = deletedNotes.filter((item) => item !== note);
    setDeletedNotes(updatedDeletedNotes);
    await storeDeletedNotes(updatedDeletedNotes);

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
            const updatedDeletedNotes = deletedNotes.filter((item) => item !== note);
            setDeletedNotes(updatedDeletedNotes);
            await storeDeletedNotes(updatedDeletedNotes);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleSelectNote = (note) => {
    const isSelected = selectedNotes.some((selectedNote) => selectedNote === note);
    if (isSelected) {
      setSelectedNotes(selectedNotes.filter((selectedNote) => selectedNote !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handleDeleteSelectedNotes = async () => {
    const updatedDeletedNotes = deletedNotes.filter((item) => !selectedNotes.includes(item));
    setDeletedNotes(updatedDeletedNotes);
    await storeDeletedNotes(updatedDeletedNotes);
    setSelectedNotes([]);
  };

  const handleRestoreSelectedNotes = async () => {
    // Restore selected notes
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = [...notes, ...selectedNotes];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

      // Remove restored notes from deleted notes
      const updatedDeletedNotes = deletedNotes.filter((item) => !selectedNotes.includes(item));
      setDeletedNotes(updatedDeletedNotes);
      await storeDeletedNotes(updatedDeletedNotes);

      setSelectedNotes([]);
    } catch (e) {
      console.error('Error restoring selected notes', e);
    }
  };

  const handleSelectAllNotes = () => {
    if (selectedNotes.length === deletedNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes([...deletedNotes]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navText}>Corbeille</Text>
        <TouchableOpacity style={styles.navItem} onPress={handleSelectAllNotes}>
          <FontAwesomeIcon name="check-square" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={deletedNotes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <TouchableOpacity onPress={() => toggleSelectNote(item)}>
              <FontAwesomeIcon
                name={selectedNotes.includes(item) ? 'check-square' : 'square-o'}
                size={24}
                color={selectedNotes.includes(item) ? '#6200ea' : '#aaa'}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.noteText}>{item.title}</Text>
              <Text style={styles.noteDescription}>{item.description}</Text>
            </View>
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
      {selectedNotes.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestoreSelectedNotes}>
            <Text style={styles.restoreButtonText}>Restaurer  ({selectedNotes.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelectedNotes}>
            <Text style={styles.deleteButtonText}>Supprimer  ({selectedNotes.length})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Trash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 25,
  },
  noteDescription: {
    fontSize: 16,
    marginTop: 5,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 2,
    height: 50,
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
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  noteText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  restoreButton: {
    backgroundColor: 'green',
    alignItems: 'center',
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  restoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    alignItems: 'center',
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
