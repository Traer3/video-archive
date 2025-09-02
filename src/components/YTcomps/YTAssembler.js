import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';
//import { videos } from "./Vids";
import {Asset} from 'expo-asset';
import { VideoView } from "expo-video";
import { useVideoPlayer } from "expo-video";
import YTVidForm from "./YTVidForm";



export default function YTAssembler () {


    //wipe all 
    // db for vid 

    useEffect(()=>{
        const getVids = async () => {
            try{
                const responce = await fetch("http://192.168.0.2:3001/videos");
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
        category: vid.category,
        created_at: vid.created_at,
        duration: vid.duration,
        id: vid.id,
        name: vid.name,
        size_mb: vid.size_mb,
        thumbnail: vid.thumbnail,
        url: vid.url,
       }))
        setVideos(parsedVideos)
        
    }

    const urls = videos.map((vid)=> vid.url)
    console.log(urls)

    const [videoData, setVideoData] = useState([]);

    useEffect(()=>{

        const loadData = async () => {
            const enriched = [];
            for(let vid of videos){
                try{
                    const asset = Asset.fromModule(vid.url.json);
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
        
    },[videos])

    useEffect(()=>{
        console.log("Updated videoDATA: ", videoData)
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
                                allowsFullscreen
                                allowsPictureInPicture
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
    }
});