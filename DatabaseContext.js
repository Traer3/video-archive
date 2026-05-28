import { createContext, useContext} from "react";
const IP = "192.168.0.8"
export const DatabaseContext = createContext();

export const DatabaseProvider = ({children}) =>{
    const SERVER_URL = `http://${IP}:3001`
    //ебануть ip и порт изменяемым из приложения 

    return(
        <DatabaseContext.Provider value={{SERVER_URL}}>
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

