import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import RenderItem from "./VideoProcessing/RenderItem";
import { VideoView, useVideoPlayer, } from "expo-video";
import VideoPlayer from "./VideoPlayer";

const DB_URL = 'http://192.168.0.8:3001';
const VIDEO_URL = 'http://192.168.0.8:3004';
//http://192.168.0.8:3004/videos?page=1&limit=74

/*
{
    "page":1,
    "total":74,
    "hasNext":true,
    "videos":[{
        "name":"ブルーアーカイブ Blue Archive OST 227.mp4",
        "url":"http://192.168.0.8:3004/%E3%83%96%E3%83%AB%E3%83%BC%E3%82%A2%E3%83%BC%E3%82%AB%E3%82%A4%E3%83%96%20Blue%20Archive%20OST%20227.mp4",
        "thumbnail":"http://192.168.0.8:3004/thumbnails/%E3%83%96%E3%83%AB%E3%83%BC%E3%82%A2%E3%83%BC%E3%82%AB%E3%82%A4%E3%83%96%20Blue%20Archive%20OST%20227.jpg"}
        ]}
*/

export default function FilteredVideos() {
    const [videos, setVideos] = useState(null);
    const [scrollAnimation, setScrollAnimation] = useState(true);
    const [deletionTrigger, setDeletionTrigger] = useState(0);

    const [selectedVideo, setSelectedVideo] = useState(null);

    const getFilteredVideos = async () =>{
        console.log("Help")
        try{
            const res = await fetch(`${DB_URL}/videos`);
            const DBVideos = await res.json();
            const filteredVideos = DBVideos.filter(video => video.filtered === true)
            console.log(filteredVideos);
            setVideos(filteredVideos);
            
        }catch(err){

        }
    }

    const keyExtractor = item => (item.id ? item.id.toString() : item.url);

    const renderItem = ({item}) =>{
        return(
            <RenderItem
                item={item}
                setScrollAnimation={setScrollAnimation}
                setSelectedVideo={setSelectedVideo}
                setDeletionTrigger={setDeletionTrigger}
                deletionTrigger={deletionTrigger}
            />
        )
    }

    return(
        <View style={styles.outerArea}>
            <View style={styles.conteiner}>
                <Pressable style={{borderColor:'red',borderWidth:1,width:"20%",height:'20%',zIndex:4}} onPress={()=>{getFilteredVideos()}}/>
                {videos && 
                <FlatList
                    style={{flex:1,zIndex:5}}
                    contentContainerStyle={{paddingBottom: 105}}
                    data={videos}
                    scrollEnabled={scrollAnimation}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    //onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    windowSize={10}
                    //ListFooterComponent={loading ? <Text style={{textAlign:'center',marginTop:"50%",fontWeight:'600',fontSize:20}}>loading...</Text> : null}
                />}

                <VideoPlayer setSelectedVideo={setSelectedVideo} selectedVideo={selectedVideo}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    outerArea: {
        position:'absolute',
        width:'100%',
        height:'92%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',
    },
    conteiner:{
        flexGrow:1,
        width:'79%',
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        overflow:'visible',
        padding:2,
        borderRadius:2,
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
    },
})