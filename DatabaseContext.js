import { createContext, useContext} from "react";
//const config = require('./database/config');
const IP = "192.168.0.8"
export const DatabaseContext = createContext();

export const DatabaseProvider = ({children}) =>{
    //const DB_URL = `${config.DB_URL}`;
    //const VIDEO_URL = `${config.VIDEO_URL}`;
    const DB_URL = `http://${IP}:3001`;
    const VIDEO_URL = `http://${IP}:3004`;


    return(
        <DatabaseContext.Provider value={{VIDEO_URL, DB_URL}}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if(!context){
        throw new Error("useDatabase must be used within a DatabaseProvider")
    }
    return context
};

