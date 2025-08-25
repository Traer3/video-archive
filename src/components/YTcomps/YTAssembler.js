import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet, FlatList, Text, Modal} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { videos } from "./Vids";
import {Asset} from 'expo-asset';
import { Video } from "expo-av";



export default function YTAssembler () {

    const [videoData, setVideoData] = useState([]);

    useEffect(()=>{
        const loadData = async () => {
            const enriched = [];
            for(let vid of videos){
                try{
                    const asset = Asset.fromModule(vid.source);
                    await asset.downloadAsync();
                    
                    if(!asset.localUri){
                        console.warn("No localUri for", vid.name);
                        continue;
                    }

                    const {uri} = await VideoThumbnails.getThumbnailAsync(asset.localUri, {time:100});

                    enriched.push({
                        ...vid,
                        thumbnail: uri,
                        duration: '00:30',
                    });
                } catch (e){
                    console.warn("Thumbnail error",e);
                }
            }
            setVideoData(enriched);
        };
        loadData();
    },[])

    const renderItem = ({item}) => (
        <TouchableOpacity style={styles.card} onPress={()=> setSelectedVideo(item.source)}>
            <Image source={{uri: item.thumbnail}} style={styles.thumbnail}/>
            <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text>Date: {item.date}</Text>
                <Text>Duration: {item.duration}</Text>
            </View>
        </TouchableOpacity>
        
    )


    const [selectedVideo, setSelectedVideo] = useState(null);


    return(
        <View style={{flex:1, }}>
            <FlatList
                data={videoData}
                keyExtractor={(item)=>item.id}
                renderItem={renderItem}
            />

            <Modal visible={!!selectedVideo} transparent={true} animationType="slide" onRequestClose={()=> setSelectedVideo(null)}>
                <View style={styles.modalBackground}>
                    <TouchableOpacity
                        style={styles.closeArea}
                        onPress={()=> setSelectedVideo(null)}
                    />
                    <View style={styles.videoContainer}>
                        <Video
                            source={selectedVideo}
                            style={styles.video}
                            resizeMode="contain"
                            useNativeControls
                            shouldPlay
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
    
};

const styles = StyleSheet.create({
    card:{
        flexDirection: 'row',
        margin: 10,
        backgroundColor:'#f2f2f2',
        borderRadius:10,
        overflow:'hidden',
    },
    thumbnail:{
        width:120,
        height:80,
    },
    info:{
        padding:10,
        flex:1,
    },
    title:{
        fontWeight:'bold',
        marginBottom: 5,
    },

    item:{
        padding:15,
        marginBottom: 10,
        backgroundColor: "#eee",
        borderRadius: 8,
        
        
    },
    text:{
        fontSize:16,

    },
    modalBackground:{
        flex:1,
        backgroundColor:"rgba(0,0,0,0.9)",
        justifyContent:'center',
        alignItems:'center',
    },
    closeArea:{
        ...StyleSheet.absoluteFillObject,
    },
    videoContainer:{
        width:'100%',
        height:'60%',
    },
    video:{
        width:'100%',
        height:'100%',
    }
});