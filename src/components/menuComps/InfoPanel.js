import { View, StyleSheet, FlatList, Pressable } from "react-native";
import InfoForm from "./InfoForm";
import { useEffect, useState } from "react";

const DB_URL = 'http://192.168.0.8:3001';

/* sort this
"SQLLogs","ExpressLogs","DownloaderLogs","ImporterLogs","EraserLogs","IsItUniqueLogs","ThumbnailGeneratorLogs"
*/
export default function InfoPanel () {
    const [dbLogs, setDBLogs] = useState(null);
    const [logs,setLogs] = useState(null)

    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${DB_URL}/logs`);
                const DBLogs = await res.json();
                setDBLogs(DBLogs);

                let newForm = [];
                let id = 0;
                const dbLogTypes = await DBLogs.map(logType => logType = logType.log_type)
                const uniqueTypes = [...new Set(dbLogTypes)]
                uniqueTypes.map(logType => newForm.push({id:id++, log_type: logType,  log: []}))
                setLogs(newForm);

            }catch(err){
                console.log("Error loading DB logs:", err);
            }
        };
        getDBData();
    },[]);



    const logFiller = async () =>{
        if(!dbLogs) return;

        for (let i = 0; i < dbLogs.length; i++) {
            for(const logType of logs){
                if(logType.log_type === dbLogs[i].log_type){
                    logType.log.push(dbLogs[i].log)
                }   
            }
        }

        /*
        for(const logType of logs){
            console.log("id: ",logType.id," Log Type: ",logType.log_type, "Log: ", logType.log);   
        }
        */
    }


    const writeLog = async (type,log) =>{
       const res = await fetch(`${DB_URL}/addLog`,{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({type, log})
       });

       if(!res.ok){
        const errorData = await res.json();
        console.error(`❌ Failed writing log: ${errorData.message}`);
        return;
       }

       const data = await res.json();
       console.log(data);
    };
   
    const Item = ({logType , log, id})=>{
        if(id === null) return;
        return (
        <View style={styles.item}>
            <InfoForm key={id} logType={logType} log={log}/>
        </View>
    )}

    // <Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{writeLog("ThumbnailGeneratorLogs","ThumbnailLogssssss")}}/>
    //<Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{LogFormer()}}/>
    return(
        <View style={styles.outerArea}>
            <Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{logFiller()}}/>
            {logs && 
            <FlatList 
                style={styles.conteiner}
                data={logs}
                renderItem={({item}) => <Item id={item.id} logType={item.log_type} log={item.log} />}
                keyExtractor={item => item.id}
            />
            }
            
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