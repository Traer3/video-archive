import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';
//import { videos } from "./Vids";
import {Asset} from 'expo-asset';
import { VideoView } from "expo-video";
import { useVideoPlayer } from "expo-video";
import YTVidForm from "./YTVidForm";



export default function YTAssembler () {

    const [videoData, setVideoData] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(()=>{
        const getVids = async () => {
            try{
                const responce = await fetch("http://192.168.0.2:3001/videos");
                const data = await responce.json();

                await loadingVideoData(data);
            } catch (err) {
                console.log("DB error: ", err);
            } finally {
                setLoading(false)
            }
       };
       getVids();
    },[])

    const preLoadVideos = async (videosList) =>{
        const assets = [];

        for (const vid of videosList){
            try{
                const asset = Asset.fromURI(vid.url);
                await asset.downloadAsync();

                assets.push({
                    ...vid,
                    asset: asset,
                    localUri: asset.localUri
                });
            }catch(err){
                console.warn(`Error preloading video ${vid.name}: `,err);
                assets.push({
                    ...vid,
                    asset: null,
                    localUri: vid.url
                });
            }
        }
        return assets;
    };


    const loadingVideoData = async (vidosList) => {
        try{
            const preLoadedVideos = await preLoadVideos(vidosList)
            const enriched = [];

            for(let vid of preLoadedVideos){
                try{
                    let thumbnailUri = null;

                    if(vid.localUri){
                        try{
                            const {uri} = await VideoThumbnails.getThumbnailAsync(vid.localUri,{
                                time: 1000,
                                quality: 0.7
                            });
                            thumbnailUri = uri;
                        }catch(thumbnailError){
                            console.warn("Thumbnail Error for ", vid.name, thumbnailError)
                        }
                    }

                    enriched.push({
                        ...vid,
                        thumbnail: thumbnailUri,
                        duration: vid.duration ? formatDuration(vid.duration) : '00:30',
                    });
                } catch (e){
                    console.warn("Processing error for ",vid.name , e);

                    enriched.push({
                        ...vid,
                        thumbnail: null,
                        duration: vid.duration ? formatDuration(vid.duration) : '00:30'
                    });
                }
            }
            setVideoData(enriched);
        }catch(err){
            console.error("Error in loadingVideoData: ", err)
        }
    };


    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}: ${secs.toString().padStart(2,'0')}`;
    }


    const renderItem = ({item}) => (
        <TouchableOpacity onPress={()=> setSelectedVideo(item.localUri || item.url)}>
            <View style={{flex:1,}}>
                <YTVidForm 
                    thumbnail={item.thumbnail ? {uri: item.thumbnail} : null} 
                    name={item.name} 
                    date={item.date} 
                    duration={item.duration}
                />
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
                ListEmptyComponent={
                    <View style={styles.center}>
                            <Text>No videos found</Text>
                    </View>
                }
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

    center:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        padding:20
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