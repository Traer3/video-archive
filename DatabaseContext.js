import { createContext, useContext} from "react";

export const DatabaseContext = createContext();

export const DatabaseProvider = ({children}) =>{
    const DB_URL = 'http://192.168.0.9:3001';
    const VIDEO_URL = 'http://192.168.0.9:3004';

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