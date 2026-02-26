import { createContext, useContext} from "react";
const config = require('./database/config');

export const DatabaseContext = createContext();

export const DatabaseProvider = ({children}) =>{
    const DB_URL = `${config.DB_URL}`;
    const VIDEO_URL = `${config.VIDEO_URL}`;


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

