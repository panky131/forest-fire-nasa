// AuthContext.js
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    auth_key: string | null,
    mobile_number: string | number | null,
    user_type: string | null,
    user_name: null,
    latitude: number,
    longitude: number,
    division_id: number | string
}

// @ts-ignore
const AuthContext = createContext();

export const AuthProvider = ({ children }: any) => {
    const [authUserData, setAuthUserData] = useState<AuthContextType>({
        auth_key: null,
        mobile_number: null,
        user_type: null,
        user_name: null,
        latitude: 30.3165,
        longitude: 78.0322,
        division_id: 0
    });

    const CheckSecureStoreCred = async () => {
        try {
            // checking for all items | auth_key, mobile_number, user_type, user_name

            // ** auth_key
            const _auth_key = await SecureStore.getItemAsync('auth_key');
            if (!_auth_key) return false;

            // ** mobile_number
            const _mobile_number = await SecureStore.getItemAsync('mobile_number');
            if (!_mobile_number) return false;

            // ** user_type
            const _user_type = await SecureStore.getItemAsync('user_type');
            if (!_user_type) return false;

            // ** user_name
            const _user_name = await SecureStore.getItemAsync('user_name');
            if (!_user_name) return false;

            const latitude = await SecureStore.getItemAsync('latitude');
            if (!latitude) return false;

            const longitude = await SecureStore.getItemAsync('longitude');
            if (!longitude) return false;

            const division_id = await SecureStore.getItemAsync('division_id');
            if (!division_id) return false;

            // setting item in context variable
            let tempObj: AuthContextType = {
                auth_key: _auth_key,
                mobile_number: _mobile_number,
                user_type: _user_type,
                user_name: _user_name as any,
                latitude: latitude as any,
                longitude: longitude as any,
                division_id
            };
            setAuthUserData(tempObj);
            return true;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const CheckForUserAuth = async () => {
        // if (!await CheckSecureStoreCred()) setIsAuthenticated(false); // unable to find all items in secure store
        // else setIsAuthenticated(true); // all items are set in authUserData
        CheckSecureStoreCred();
    }

    const login = async () => {
        await CheckSecureStoreCred();
        // setIsAuthenticated(true);
    };

    const logout = async () => {
        // deleting all items from secure Store
        await SecureStore.deleteItemAsync('auth_key');
        await SecureStore.deleteItemAsync('mobile_number');
        await SecureStore.deleteItemAsync('user_type');
        await SecureStore.deleteItemAsync('user_name');
        await SecureStore.deleteItemAsync('latitude');
        await SecureStore.deleteItemAsync('longitude');
        await SecureStore.deleteItemAsync('division_id');

        let tempObj = {
            auth_key: null,
            mobile_number: null,
            user_type: null,
            user_name: null,
            latitude: 30.3165,
            longitude: 78.0322,
            division_id: null
        };
        // @ts-ignore
        setAuthUserData(tempObj);
        // setIsAuthenticated(false)
    }

    useEffect(() => {

        // it is a function to validate the use Auth
        CheckForUserAuth();

        return () => { }
    }, [])


    return (
        <AuthContext.Provider value={{ login, logout, authUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
