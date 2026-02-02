import { View, StyleSheet, FlatList, Pressable } from "react-native";
import InfoForm from "./InfoForm";
import { useEffect, useState } from "react";

const DB_URL = 'http://192.168.0.8:3001';

/* sort this
"SQLLogs","ExpressLogs","DownloaderLogs","ImporterLogs","EraserLogs","IsItUniqueLogs","ThumbnailGeneratorLogs"
*/
export default function InfoPanel () {
    const [SQLInfo, setSQLInfo] = useState(null);
    

    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${DB_URL}/logs`);
                const arr = await res.json();
                setSQLInfo(arr);
                //console.log('DB logs loaded');
            }catch(err){

                console.log("Error loading DB logs:", err);
            }
        };
        getDBData();
 
    },[])

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

   

    const LogContainerGenerator = (DBLogs, type, log) =>{
        const dbLogTypes = DBLogs.map(logType => logType = logType.log_type)
        const uniqueTypes = [...new Set(dbLogTypes)]
       // console.log("DB log types", uniqueTypes);
        
        return uniqueTypes
    }

    if(SQLInfo){
        const uniqueTypes = LogContainerGenerator(SQLInfo)
        console.log(uniqueTypes)
        const logContainer = Array.from({length:uniqueTypes.length},(_,i)=>(
            <InfoForm key={i} serverName={uniqueTypes[i]}/>
        ))
        return(
            <>{logContainer}</>
        )
    }


    const Item = ({ title , log})=>(
        <View style={styles.item}>
            <InfoForm serverName={title} log={log}/>
        </View>
    )
    // <Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{writeLog("ThumbnailGeneratorLogs","ThumbnailLogssssss")}}/>
    return(
        <View style={styles.outerArea}>
            <Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:3}} onPress={()=>{LogContainerGenerator(SQLInfo)}}/>
            <FlatList 
                style={styles.conteiner}
                //style={{height:"80%",width:'90%',borderColor:'red',borderWidth:1,marginTop:40,zIndex:3}}
                data={SQLInfo}
                renderItem={({item}) => <Item title={item.log_type} log={item.log} />}
                keyExtractor={item => item.id}
            />
            
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