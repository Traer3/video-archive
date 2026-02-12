import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View,} from "react-native";
import RenderItem from "./VideoProcessing/RenderItem";
import VideoPlayer from "./VideoPlayer";

const DB_URL = 'http://192.168.0.8:3001';
const VIDEO_URL = 'http://192.168.0.8:3004';

export default function FilteredVideos({setShowFiltered}) {
    const [videos, setVideos] = useState(null);
    const [scrollAnimation, setScrollAnimation] = useState(true);
    const [deletionTrigger, setDeletionTrigger] = useState(0);

    const [selectedVideo, setSelectedVideo] = useState(null);

    const getDBData = async (url,param,param2) =>{
        const res = await fetch(`${url}${param}${param2}`)
        const DBRes = await res.json();
        return DBRes;
    }

    useEffect(()=>{
        async function getAndMergeAllVideos() {
            try{
                const DBVideos = await getDBData(DB_URL,"/videos","");
                const filteredVideos = DBVideos.filter(video => video.filtered === true)

                const totalRes = await getDBData(VIDEO_URL,"/videos","");
                
                const urlsData = await getDBData(VIDEO_URL,"/videos?page=1&limit=",totalRes.total);

                const unNormolizeName = (name) => name + ".mp4";

                const newDBForm = filteredVideos.map(vid => {
                    const newName = unNormolizeName(vid.name)
                    const expressData = urlsData.videos.find(video => video.name === newName)
                    return{
                        ...vid,
                        thumbnail: expressData ? expressData.thumbnail : vid.thumbnail
                    }
                })
                setVideos(newDBForm)
            }catch(err){
                console.log("Error merging videos: ",err )
            }
        }
        getAndMergeAllVideos()
    },[])
    
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
        <View style={styles.componentContainer}>
            <Pressable style={styles.outerArea} onPressIn={()=>{setShowFiltered(false)}}/>
            <View style={styles.conteiner}>
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
    componentContainer: {
        position:'absolute',
        width:'100%',
        height:'92%',
        justifyContent:'center',
        alignItems:'center',
    },
    outerArea: {
        position:'absolute',
        width:'100%',
        height:'92%',
        zIndex:4
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