import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoView, useVideoPlayer, } from "expo-video";
import YTVidForm from "./YTVidForm";

import placeholder from "../../../assets/AronaServer.jpg"


export default function YTAssembler () {

    useEffect(()=>{
        const getVids = async () => {
            try{
                const responce = await fetch("http://192.168.0.8:3001/videos");
                const data = await responce.json();
                urlReader(data)
            }catch(err){
                console.log("DB error: ", err)
            }
        }
        getVids();
       
    },[])

    const [videos, setVideos] = useState([])

    const urlReader = (DBvideos) => {
       const parsedVideos = DBvideos.map((vid)=>({
        ...vid,
        url: vid.url
       }))
        setVideos(parsedVideos)
        
    }

    const [videoData, setVideoData] = useState([]);


    useEffect(()=>{
        const loadData = async () => {
            const enriched = [];

            for(let vid of videos){
                try{
                         
                    let VideoUrl = String(vid.url)

                    const {uri} = await VideoThumbnails.getThumbnailAsync(VideoUrl, {time:1000});

                    enriched.push({
                        ...vid,
                        thumbnail: uri,
                        duration: '00:30', // заменить фиксированое время на актуальное

                    });

                    
                } catch (e){
                    console.warn("Thumbnail error",vid.id);
                    enriched.push({
                        ...vid,
                        thumbnail: Image.resolveAssetSource(placeholder).uri,
                        duration: "a lot"
                    })
                    continue;
                }
            }
            setVideoData(enriched);
            
        };
        loadData();
        
    },[videos])

    const [showTestUpdate, setShowTestUpdate] = useState(0)
    useEffect(()=>{
        setShowTestUpdate(prevState => prevState +1)
        console.log("Updated videoDATA",  showTestUpdate , )
    },[videoData])

    const renderItem = ({item}) => (
        <TouchableOpacity onPress={()=> setSelectedVideo(item.url)}>
            <View style={{flex:1,}}>
                <YTVidForm thumbnail={{uri: item.thumbnail}} name={item.name} date={item.date} duration={item.duration}/>
            </View>
        </TouchableOpacity>
        
    )


    const [selectedVideo, setSelectedVideo] = useState(null);
    const player = useVideoPlayer(
        selectedVideo,
        (player) => {
            player.loop = false
            player.play();
        }
    );


    return(
        <View style={{flex:1, }}>
            <FlatList
                data={videoData}
                keyExtractor={(item)=>item.id.toString()}
                renderItem={renderItem}
            />
            <Modal visible={!!selectedVideo} transparent={true} animationType="slide" onRequestClose={()=> setSelectedVideo(null)}>
                <View style={styles.modalBackground}>
                    
                    <TouchableOpacity
                        style={styles.closeArea}
                        onPress={()=> setSelectedVideo(null)}
                    />
                    <View style={styles.videoContainer}>
                        {selectedVideo && (
                            <VideoView
                                style={styles.video}
                                player={player}
                                fullscreenOptions={{
                                    enable: true,
                                }}
                                nativeControls
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    )
    
};

const styles = StyleSheet.create({
    
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
        backgroundColor:"rgba(0,0,0,0.5)",
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
    },
});