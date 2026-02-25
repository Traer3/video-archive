import { View, StyleSheet, FlatList, Pressable } from "react-native";
import InfoForm from "./InfoForm";
import { useEffect, useState } from "react";
import { useDatabase } from "../../../DatabaseContext";

/* sort this
"SQLLogs","ExpressLogs","DownloaderLogs","ImporterLogs","EraserLogs","IsItUniqueLogs","ThumbnailGeneratorLogs"
*/
export default function InfoPanel () {
    const {DB_URL} = useDatabase();
    const [dbLogs, setDBLogs] = useState(null);
    const [logs,setLogs] = useState(null)

    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${DB_URL}/logs`);
                const DBLogs = await res.json();
                setDBLogs(DBLogs);

                let filteredType = [];
                let id = 0;
                const dbLogTypes = await DBLogs.map(logType => logType = logType.log_type)
                const uniqueTypes = [...new Set(dbLogTypes)]
                uniqueTypes.map(logType => filteredType.push({id:id++, log_type: logType,  log: []}))
               
                await logFiller(DBLogs,filteredType);

                setLogs(filteredType);
            }catch(err){
                console.log("Error loading DB logs:", err);
            }
        };
        getDBData();
    },[]);


    const logFiller = async (dbLogs, filteredType) =>{
        if(!dbLogs) {return console.log("DB empty") }
        //console.log("Worked!")

        for (let i = 0; i < dbLogs.length; i++) {
            let desiredLog = filteredType.find(logType => logType.log_type === dbLogs[i].log_type);
            
            if(desiredLog){
                desiredLog.log.push({message:dbLogs[i].log ,createdAt: dbLogs[i].created_at,})
                //console.log(desiredLog)
                setLogs(desiredLog)
            };
        };
    };
    
    const Item = ({logType , log, id})=>{
        if(id === null) return;
        //console.log(log)
        return (
        <View style={styles.item}>
            <InfoForm key={id} logType={logType} log={log}/>
        </View>
    )}

    //<Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{logWriter()}}/>
    return(
        <View style={styles.outerArea}>
            {logs && <FlatList 
                style={styles.conteiner}
                data={logs}
                renderItem={({item}) => <Item id={item.id} logType={item.log_type}  log={item.log}/>}
                keyExtractor={item => item.id}
            />}
            
            
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        
        width:'90%',
        height:'90%',
        backgroundColor:'rgb(71, 103, 151)',
       

        borderRadius:2,
        borderWidth:2,
        borderColor:'rgb(43,75,123)',

        marginTop:40,
        zIndex:3,
        
        //borderWidth:3,
        //borderColor:'yellow',
        //alignItems:'center',
        //flexDirection:'column',
    },
    
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'92%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',   
    },
    item:{
        borderColor:'green',
        borderWidth:1,
        width:'100%'
    }
})