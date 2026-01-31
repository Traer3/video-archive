import { View, StyleSheet, FlatList, Text } from "react-native";
import InfoForm from "./InfoForm";
import { useEffect, useState } from "react";
import ServerLoading from "../ServerLoading";

const DB_URL = 'http://192.168.0.8:3001';

const ExpressLogs = "Express Logs";
const VideoDownloaderLogs = "Video Downloader Logs";
const VideoImporterLogs = "Video Importer Logs";
const VideoEraserLogs = "Video Eraser Logs";
const IsItUniqueLogs = "Is It Unique Logs";
const ThumbnailGeneratorLogs = "Thumbnail Generator Logs";
export default function InfoPanel () {
    const [SQLInfo, setSQLInfo] = useState(null);
    

    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${DB_URL}/info`);
                const arr = await res.json();
                setSQLInfo(arr);
                console.log('DB videos loaded');
            }catch(err){

                console.log("Error loading DB videos:", err);
            }
        };
        getDBData();
 
    },[])

    /*
                    <InfoForm serverName={SQLInfo}/>
                    <InfoForm serverName={ExpressLogs}/>
                    <InfoForm serverName={VideoDownloaderLogs}/>
                    <InfoForm serverName={VideoImporterLogs}/>
                    <InfoForm serverName={VideoEraserLogs}/>
                    <InfoForm serverName={IsItUniqueLogs}/>
                    <InfoForm serverName={ThumbnailGeneratorLogs}/>

                    const ExpressLogs = "Express Logs";
                    const VideoDownloaderLogs = "Video Downloader Logs";
                    const VideoImporterLogs = "Video Importer Logs";
                    const VideoEraserLogs = "Video Eraser Logs";
                    const IsItUniqueLogs = "Is It Unique Logs";
                    const ThumbnailGeneratorLogs = "Thumbnail Generator Logs";
    */

    const data = [
        {id: '1',title: 'SQLInfo',},
        {id: '2',title: 'Express Logs'},
        {id: '3',title: 'Video Downloader Logs',},
        {id: '4',title: 'Video Importer Logs'},
        {id: '5',title: 'Video Eraser Logs',},
        {id: '6',title: 'Is It Unique Logs',},
        {id: '7',title: 'Thumbnail Generator Logs'},
    ];
    
    const Item = ({ title })=>(
        <View style={styles.item}>
            <InfoForm serverName={title}/>
        </View>
    )

    return(
        <View style={styles.outerArea}>
            <FlatList 
                style={styles.conteiner}
                //style={{height:"80%",width:'90%',borderColor:'red',borderWidth:1,marginTop:40,zIndex:3}}
                data={data}
                renderItem={({item}) => <Item title={item.title} />}
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