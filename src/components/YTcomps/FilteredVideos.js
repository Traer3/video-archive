import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View,} from "react-native";
import RenderItem from "./VideoProcessing/RenderItem";
import VideoPlayer from "./VideoPlayer";
import { useDatabase } from "../../../DatabaseContext";

//Может переделать 
/*
Я могу буквально импортировать YTAssembler 
Сделать для него тригер по выбору нужного RenderItem , сами видосы уже передаем
*/
export default function FilteredVideos({setShowFiltered}) {
    const {SERVER_URL} = useDatabase();
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
                const DBVideos = await getDBData(SERVER_URL,"/api/server/videoList","");
                const filteredVideos = DBVideos.data.filter(video => video.filtered === true)

                const urlsData = await getDBData(SERVER_URL,"/api/server/videos?page=1&limit=",DBVideos.data.length);

                const unNormolizeName = (name) => name + ".mp4";

                const newDBForm = filteredVideos.map(vid => {
                    const newName = unNormolizeName(vid.name)
                    const expressData = urlsData.videos.find(video => video.name === newName)
                    return{
                        ...vid,
                        url: expressData ? expressData.url : vid.url,
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

    const renderItem = useCallback (({item}) => (
            <RenderItem
                item={item}
                setScrollAnimation={setScrollAnimation}
                setSelectedVideo={setSelectedVideo}
                setDeletionTrigger={setDeletionTrigger}
                deletionTrigger={deletionTrigger}
                eraseVideoFlag={true}
            />
        ),[deletionTrigger])

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