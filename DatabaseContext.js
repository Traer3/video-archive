import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

export const DatabaseContext = createContext();

const BASE_IP = '192.168.0.9'
const BASE_PORT = '3001'

export const DatabaseProvider = ({ children }) => {
    const [serverData, setServerData] = useState({ ip: BASE_IP, port: BASE_PORT });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const initLoad = async () => {
            try{
                const loadedData = await loadFromPhone();
                console.log("loadedData: ",loadedData)
                setServerData(loadedData)
            }catch(err){
                console.error("Error loading data from phone: ",err);
            }finally{
                setLoading(false);
            }
        };
        initLoad();
    }, [])

    const loadFromPhone = async () => {
        try {
            let jsonValue
            jsonValue = await AsyncStorage.getItem('@serverData');
            return jsonValue != null ? JSON.parse(jsonValue) : { ip: BASE_IP, port: BASE_PORT }
        } catch (err) {
            console.error("Error while loading data");
        }
    }

    const updateServerConfig = async (newIP, newPort) => {
        const updateConfig = {
            ip: newIP || BASE_IP,
            port: newPort || BASE_PORT
        };

        try{
            const jsonValue = JSON.stringify(updateConfig)
            await AsyncStorage.setItem('@serverData', jsonValue);
            setServerData(updateConfig);
            console.log("Data saved! : ", updateConfig)
        }catch(err){
            console.error("Error saving data: ", err);
        }
    }
    
    const currentServerURL = `http://${serverData.ip}:${serverData.port}`

    return (
        <DatabaseContext.Provider value={{ 
            SERVER_URL: currentServerURL,
            updateServerConfig,
            loading 
            }}>
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

