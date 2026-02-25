import { useRef, useState } from "react";
import {View, StyleSheet, FlatList, Text, Modal} from "react-native";
import { DurationFetcher } from "./VideoProcessing/DurationFetcher";
import RenderItem from "./VideoProcessing/RenderItem";
import { useSaveVideo } from "./VideoProcessing/SaveVideoData";
import ServerLoading from "../ServerLoading";
import VideoPlayer from "./VideoPlayer";
import { useDatabase } from "../../../DatabaseContext";

export default function YTAssembler ({dbVideos}) {
    const {VIDEO_URL} = useDatabase();
    const [videos, setVideos] = useState([]);

    const [selectedVideo, setSelectedVideo] = useState(null);

    const page = useRef(0);
    const hasNext = useRef(true)

    const [loading, setLoading] = useState(false);
    const [offline, setOffline] = useState(false);

    const [deletionTrigger, setDeletionTrigger] = useState(0);
    const [scrollAnimation, setScrollAnimation] = useState(true);
    
    const fetchAllVideos = async (pageNum = 1) => {
       // console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
       try{
        const urlResponse = await fetch(`${VIDEO_URL}/videos?page=${pageNum}&limit=10`);
        const urlData = await urlResponse.json()

        hasNext.current = urlData.hasNext

        const normolizeName = (name) => name.replace(/\.mp4$/i, '');
        const newFormPage = urlData.videos.map(u => {
            const urlName = normolizeName(u.name);

            const dbVid = dbVideos.find(db => db.name === urlName);

            return{
                id: dbVid ? dbVid.id : null,
                name: u.name,
                url: u.url,
                thumbnail: u.thumbnail,
                duration: dbVid ? dbVid.duration : null,
                isitunique: dbVid ? dbVid.isitunique : false,
            };
        });
        console.log('Loaded page ', pageNum, 'items:', newFormPage.length);
        return newFormPage 

        }catch(err){
            console.log("Error merging videos : ", err)
            setLoading(false);
            setOffline(true);
        }
    }

    const loadMore = async () => {
        const nextPage = page.current + 1;
        
        if(hasNext.current && nextPage <= 5){
            const newFormPage = await fetchAllVideos(nextPage)
            page.current = nextPage;
            loadMore()

            updateVideo(newFormPage)
        }else{
            console.log("SlowerPase")
            const newFormPage = await fetchAllVideos(nextPage)
            page.current = nextPage;
            updateVideo(newFormPage)
        }
    };

    const updateVideo = (vids) =>{
        setVideos(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const unique = vids.filter(v => !existingIds.has(v.id));
            return[...prev, ...unique];
        });
    }
  
    const keyExtractor = item => (item.id ? item.id.toString() : item.url);

    const {saveVideoData} = useSaveVideo();
   
    const renderItem = ({item}) => {
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
        <View style={{flex:1}}>
            {videos.find(v => !v.duration) && (
                <DurationFetcher
                    key={videos.find(v => !v.duration).id}
                    url={videos.find(v => !v.duration).url}
                    onDurationReady={(dur)=>{
                        const target = videos.find(v => !v.duration);
                        saveVideoData(target.id, dur);
                        setVideos(prev =>
                            prev.map(v=>
                                v.id === target.id ? {...v, duration: dur} : v
                            )
                        );
                    }}
                />
            )}
            {offline && 
                <ServerLoading/>
            }
            <FlatList
                style={{flex:1,}}
                contentContainerStyle={{paddingBottom: 105}}
                data={videos}
                scrollEnabled={scrollAnimation}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={false}
                initialNumToRender={10}
                windowSize={10}
                ListFooterComponent={loading ? <Text style={{textAlign:'center',marginTop:"50%",fontWeight:'600',fontSize:20}}>loading...</Text> : null}
            />

            <VideoPlayer setSelectedVideo={setSelectedVideo} selectedVideo={selectedVideo}/>
            
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
    
});