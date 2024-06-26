import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TextInput,
    Pressable,
    Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import React, { useState } from "react";

const Login = ({ navigation }) => {
    const [username, setUsername] = useState("");
    
    
    const storeUsername = async () => {
        try {
            await AsyncStorage.setItem("username", username);
            navigation.navigate("Home");
        } catch (e) {
            Alert.alert("Error! While saving username");
        }
    };
    
    const handleLogin = () => {
        if (username.trim()) {
            //👇🏻 calls AsyncStorage function
            storeUsername();
        } else {
            Alert.alert("Username is required.");
        }
    };


    return (
        <SafeAreaView style={styles.loginScreen}>
            <View style={styles.loginContainer}>
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        marginBottom: 15,
                        textAlign: "center",
                    }}
                >
                    Login
                </Text>
                <View style={{ width: "100%" }}>
                    <TextInput
                        style={styles.textInput}
                        value={username}
                        onChangeText={(value) => setUsername(value)}
                    />
                </View>
                <Pressable onPress={handleLogin} style={styles.loginButton}>
                    <View>
                        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
                            SIGN IN
                        </Text>
                    </View>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Login;


const styles = StyleSheet.create({
	loginScreen: {
		flex: 1,
	},
	loginContainer: {
		flex: 1,
		padding: 10,
		flexDirection: "column",
		justifyContent: "center",
	},
	textInput: {
		borderWidth: 1,
		width: "100%",
		padding: 12,
		marginBottom: 10,
	},
	loginButton: {
		width: 150,
		backgroundColor: "#0D4C92",
		padding: 15,
	},
});