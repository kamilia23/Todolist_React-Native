import React, { useEffect, useState, useRef  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput,TouchableWithoutFeedback, Animated, FlatList, RefreshControl,Modal } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition du composant Home
const Home = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [listMode, setListMode] = useState('grid');
  const [slideAnim] = useState(new Animated.Value(-250)); // Valeur initiale pour cacher le menu
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [notes, setNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
   const [selectedNote, setSelectedNote] = useState(null);
   const [isArchived, setIsArchived] = useState(false); // Etat pour archiver la note
   const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false); // Etat pour ajouter à une playliste
   const [archivedNotes, setArchivedNotes] = useState([]); // Etat pour archiver la note




  const toggleListMode = () => {
    setListMode((prevMode) => (prevMode === 'grid' ? 'list' : 'grid'));
  };

  const toggleDropdownMenu = () => {
    const slideTo = isDropdownVisible ? -250 : 0;

    Animated.timing(slideAnim, {
      toValue: slideTo,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setDropdownVisible(!isDropdownVisible);
  };
  const handleClickOutside = (event) => {
    if (isDropdownVisible && !event.target.closest('.dropdownMenu')) {
      toggleDropdownMenu();
    }
  };
 const closeDropdownMenu = () => {
    if (isDropdownVisible) {
      toggleDropdownMenu();
    }
  };
 

  const handleAddItem = () => {
    if (newItem.trim()) {
      setData([...data, { key: newItem }]);
      setNewItem('');
      setIsAddingItem(false);
    }
  };
  const handleAddNote = async () => {
    if (newNoteTitle.trim() && newNoteDescription.trim()) {
      const newNote = { title: newNoteTitle, description: newNoteDescription };
  
      // Ajouter une propriété "archived" si l'option est sélectionnée
      if (isArchived) {
        
        const updatedArchivedNotes = [...archivedNotes, newNote];
        setArchivedNotes(updatedArchivedNotes);
        await AsyncStorage.setItem('archivedNotes', JSON.stringify(updatedArchivedNotes));
      
       // Supprimer la note des notes principales
            const updatedNotes = notes.filter(note => note !== newNote);
            setNotes(updatedNotes);
            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      } else {
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
  
      resetForm();
      setIsAddingNote(false);
      setSelectedNote(false);
    }
  };

  const resetForm = () => {
    setNewNoteTitle('');
    setNewNoteDescription('');
    setIsArchived(false);
    setIsAddingToPlaylist(false);
  };
  
  

 
 const storeNotes = async (notesToStore) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(notesToStore));
    } catch (e) {
      console.error('Error storing notes', e);
    }
  };


  const handleDeleteNote = async (noteToDelete) => {
    if (noteToDelete.archived) {
      // Supprimer la note archivée
      const updatedArchivedNotes = archivedNotes.filter((note) => note !== noteToDelete);
      setArchivedNotes(updatedArchivedNotes);
      await AsyncStorage.setItem('archivedNotes', JSON.stringify(updatedArchivedNotes));
    } else {
      // Supprimer la note non archivée
      const updatedNotes = notes.filter((note) => note !== noteToDelete);
      setNotes(updatedNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    }
  
    try {
      // Enregistrer la note supprimée dans AsyncStorage
      const storedDeletedNotes = await AsyncStorage.getItem('deletedNotes');
      const deletedNotes = storedDeletedNotes ? JSON.parse(storedDeletedNotes) : [];
      const updatedDeletedNotes = [...deletedNotes, noteToDelete];
      await AsyncStorage.setItem('deletedNotes', JSON.stringify(updatedDeletedNotes));
    } catch (e) {
      console.error('Error storing deleted note', e);
    }
  };
  


  const handleNotePress = (note) => {
     // setIsAddingNote(true);
      setSelectedNote(note);
      setNewNoteTitle(note.title);
      setNewNoteDescription(note.description);
      setIsArchived(note.archived || false);
      
    };
    const handleEditNote = () => {
      // Logic to edit the selected note
      if (selectedNote) {
        const updatedNotes = notes.map((note) =>
          note === selectedNote ? { ...note, title: newNoteTitle, description: newNoteDescription } : note
        );
        setNotes(updatedNotes);
        storeNotes(updatedNotes);
        setSelectedNote(null); // Close the modal after editing
      }
    };
    useEffect(() => {
      const fetchNotes = async () => {
        try {
          const storedNotes = await AsyncStorage.getItem('notes');
          if (storedNotes) {
            setNotes(JSON.parse(storedNotes));
          } else {
            setNotes([]); // Assurez-vous de définir une valeur initiale vide si aucune note n'est trouvée
          }
        } catch (e) {
          console.error('Error loading notes', e);
        }
      };
  
      const fetchArchivedNotes = async () => {
        try {
          const storedArchivedNotes = await AsyncStorage.getItem('archivedNotes');
          if (storedArchivedNotes) {
            setArchivedNotes(JSON.parse(storedArchivedNotes));
          } else {
            setNotes([]); // Assurez-vous de définir une valeur initiale vide si aucune note n'est trouvée
          }
        } catch (e) {
          console.error('Error loading archived notes', e);
        }
      };
  
      fetchNotes();
      fetchArchivedNotes();
  
      const focusListener = navigation.addListener('focus', () => {
        fetchNotes();
        fetchArchivedNotes();
      });
  
      return () => {
        navigation.removeListener('focus', () => {
          fetchNotes();
          fetchArchivedNotes();
        });
      };
    }, [navigation]);

    const [editingIndex, setEditingIndex] = useState(-1); // État pour suivre l'index de l'élément en cours d'édition
const [editItemValue, setEditItemValue] = useState(''); // État pour stocker la valeur modifiée

const handleEditItem = (index) => {
  setEditingIndex(index);
  setEditItemValue(data[index].key); // Pré-remplir la valeur actuelle de l'élément à modifier
};

const handleSaveEdit = () => {
  if (editItemValue.trim() && editingIndex !== -1) {
    const updatedData = [...data];
    updatedData[editingIndex].key = editItemValue; // Mettre à jour la valeur de l'élément modifié
    setData(updatedData);
    setEditingIndex(-1); // Réinitialiser l'état d'édition
    setEditItemValue(''); // Réinitialiser la valeur d'édition
  }
};


const handleCancelEdit = () => {
  setEditingIndex(-1); // Réinitialiser l'état d'édition
  setEditItemValue(''); // Réinitialiser la valeur d'édition
};
    
    const handleDeleteItem = (index) => {
      // Logique pour supprimer l'élément à l'index spécifié
      // Par exemple, supprimer l'élément du tableau de données
      const updatedData = [...data];
      updatedData.splice(index, 1);
      setData(updatedData);
    };
    

  return ( 
  <TouchableWithoutFeedback onPress={closeDropdownMenu}>
    <View style={styles.container}>
      <View style={styles.navbarsearch}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#ffffff"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={setSearchText}>
          <FontAwesomeIcon name="search" size={24} marginTop={5} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.navItem]} onPress={toggleDropdownMenu}>
          <FontAwesomeIcon name="bars" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Animated.View style={[styles.dropdownMenu, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity style={styles.dropdownText} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.dropdownText}>
              <FontAwesomeIcon name="comment" size={24} color="#000" /> Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={() => navigation.navigate('Archive')}>
            <Text style={styles.dropdownText}><FontAwesomeIcon name="archive" size={24} color="#000" /> Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={() => navigation.navigate('Trash')}>
            <Text style={styles.dropdownText}><FontAwesomeIcon name="trash" size={24} color="#000" /> Corbeille</Text>
          </TouchableOpacity> 
          {data.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                {editingIndex === index ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editItemValue}
                      onChangeText={setEditItemValue}
                    />
                    <TouchableOpacity onPress={handleSaveEdit}>
                      <FontAwesomeIcon name="check" size={20} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEdit}>
                      <FontAwesomeIcon name="times" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                  <TouchableOpacity onPress={() => handleEditItem(index)}>
                    <Text style={styles.dropdownText}>{item.key}</Text>
                  </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(index)}>
                  <FontAwesomeIcon name="trash" size={20} color="red" />
                </TouchableOpacity></>
                )}
                
              </View>
          ))}



          <TouchableOpacity  >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity  >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity  >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity  >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity>
          <TouchableOpacity >
            <Text style={styles.dropdownText}> </Text>
          </TouchableOpacity> 
          
         
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
            <Text left={-70} marginBottom={-20} style={styles.dropdownText}><FontAwesomeIcon  name="gear" size={24} color="#000" /> Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Login')}>
            <Text left={-75} style={styles.dropdownText}><FontAwesomeIcon  name="user" size={24} color="#000" /> log out</Text>
          </TouchableOpacity>

         
          {isAddingItem && (
  <View style={styles.addItemContainer}>
    <TextInput
      style={styles.addItemInput}
      placeholder="Nouveau libellé"
      value={newItem}
      onChangeText={setNewItem}
    />
    <TouchableOpacity onPress={handleAddItem}>
      <FontAwesomeIcon name="check" size={24} color="green" />
    </TouchableOpacity>
  </View>
)}

<TouchableOpacity style={styles.addButtons} onPress={() => setIsAddingItem(true)}>
<Text  style={styles.navTexts} >  <FontAwesomeIcon name="plus" size={15} color="blue" /> Ajouter libellé
</Text>
</TouchableOpacity>

        </Animated.View>

        
        <TouchableOpacity style={styles.navItem} onPress={toggleListMode}>
          <FontAwesomeIcon name={listMode === 'grid' ? 'list' : 'th'} size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <FontAwesomeIcon name="gear" style={styles.navText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <FontAwesomeIcon name="user" style={styles.navText} />
        </TouchableOpacity>
      </View>
     


      <View style={styles.body}>
         
        <TouchableOpacity style={styles.addButtone} onPress={() => { resetForm(); setIsAddingNote(true); }}>
          <FontAwesomeIcon name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddingNote}
          onRequestClose={() => setIsAddingNote(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ajouter une note</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Titre de la note"
                value={newNoteTitle}
                onChangeText={setNewNoteTitle}
              />
              <TextInput
                style={[styles.modalInput, { height: 100 }]}
                placeholder="Description de la note"
                value={newNoteDescription}
                onChangeText={setNewNoteDescription}
                multiline={true}
              />
                 {/* Option pour archiver la note */}
            <TouchableOpacity
              style={[styles.modalButton, isArchived  ? styles.modalButtonActive : null]}
              onPress={() => setIsArchived(!isArchived)}
            >
              <Text style={styles.modalButtonText}>Archiver</Text>
            </TouchableOpacity>

            {/* Option pour ajouter à une playliste */}
            <TouchableOpacity
              style={[styles.modalButton, isAddingToPlaylist && styles.modalButtonActive]}
              onPress={() => setIsAddingToPlaylist(!isAddingToPlaylist)}
            >
              <Text style={styles.modalButtonText}>Ajouter à la playliste</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.modalButton} onPress={() => setIsAddingNote(false)}>
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddNote}>
                <Text style={styles.modalButtonText}>Ajouter la note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      

        <FlatList
        data={notes}
        key={listMode}
        numColumns={listMode === 'grid' ? 2 : 1}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.noteItem} onPress={() => handleNotePress(item)}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteDescription}>{item.description}</Text>
            <TouchableOpacity onPress={() => handleDeleteNote(item)}>
              <FontAwesomeIcon name="trash" size={24} color="red" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Modal for viewing or editing a selected note */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedNote}
        onRequestClose={() => setSelectedNote(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Détails de la note</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Titre de la note"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 100 }]}
              placeholder="Description de la note"
              value={newNoteDescription}
              onChangeText={setNewNoteDescription}
              multiline={true}
            />
             {/* Option pour archiver la note */}
              <TouchableOpacity
              style={[styles.modalButton, isArchived  ? styles.modalButtonActive : null]}
              onPress={() => setIsArchived(!isArchived)}
            >
              <Text style={styles.modalButtonText}>Archiver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleAddNote}>
                <Text style={styles.modalButtonText}>Ajouter la note</Text>
              </TouchableOpacity>
            {/* Option pour ajouter à une playliste */}
            <TouchableOpacity
              style={[styles.modalButton, isAddingToPlaylist  ? styles.modalButtonActive : null]}
              onPress={() => setIsAddingToPlaylist(!isAddingToPlaylist)}
            >
              <Text style={styles.modalButtonText}>Ajouter à la playliste</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedNote(false) }>
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleEditNote}>
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>

      </View>

    </View></TouchableWithoutFeedback>
  );
};

// Définition des styles pour le composant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop:25
  },
  modalButtonActive: {
    backgroundColor: '#6200ea', // Couleur différente pour indiquer l'état sélectionné
  },
  itemContainer: {
    flexDirection: 'row', // Disposition en ligne pour les éléments
    alignItems: 'center', // Alignement vertical au centre
    justifyContent: 'space-between', // Espace entre les éléments
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 10,
  },
  editContainer: {
    flexDirection: 'row', // Disposition en ligne pour les éléments en édition
    alignItems: 'center', // Alignement vertical au centre
  },
  editInput: {
    flex: 1, // Pour que le TextInput s'étende autant que possible
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  navbarsearch: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#6200ea',
    opacity: 0.5,
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#6200ea',
  },
  navItem: {
    padding: 10,
    alignItems: 'center',
  },
  navText: {
    color: '#ffffff',
    fontSize: 18,
  },
  navTexts: {
    color: '#000',
    fontSize: 12,
    marginTop:-10
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  dropdownText: {
    fontSize: 18,
    paddingVertical: 5,
  },
  body: {
    flex: 1,
    padding: 10,
    zIndex:-999
  },
  addButton: {
    backgroundColor: '#0D4C92',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  addButtons: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 50,
    alignSelf: 'flex-end',
  },
  addButtone: {
    backgroundColor: '#0D4C92',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:10,
    borderRadius: 70,
    right:5,
    zIndex:999,
    alignSelf: 'flex-end',
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addItemContainer:{
    marginTop:10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#0D4C92',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    color: '#ffffff',
    paddingLeft: 10,
    marginHorizontal: 10,
  },
  noteText: {
    fontSize: 16,
  },
});
// Exportation du composant Home
export default Home;
