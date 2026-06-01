import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

export const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
    const [serverData, setServerData] = useState(null);
    useEffect(() => {
        const initLoad = async () => {
            const loadedData = await loadFromPhone();
            setServerData(loadedData)
        };
        initLoad();
    }, [])

    const loadFromPhone = async () => {
        try {
            let jsonValue
            jsonValue = await AsyncStorage.getItem('@serverData');
            return jsonValue != null ? JSON.parse(jsonValue) : { ip: '192.168.0.8', port: '3001' }
        } catch (err) {
            console.error("Error while loading data");
        }
    }

    let IP = serverData != null ? serverData.ip : "192.168.0.8"
    let PORT = serverData != null ? serverData.port : '3001'
    const SERVER_URL = `http://${IP}:${PORT}`

    return (
        <DatabaseContext.Provider value={{ SERVER_URL }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error("useDatabase must be used within a DatabaseProvider")
    }
    return context
};

