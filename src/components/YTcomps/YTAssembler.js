import { useCallback, useRef, useState } from "react";
import {View, FlatList, Text} from "react-native";
import { DurationFetcher } from "./VideoProcessing/DurationFetcher";
import RenderItem from "./VideoProcessing/RenderItem";
import { useSaveVideo } from "./VideoProcessing/SaveVideoData";
import ServerLoading from "../ServerLoading";
import VideoPlayer from "./VideoPlayer";
import { useDatabase } from "../../../DatabaseContext";

export default function YTAssembler ({videoTable}) {
    const {SERVER_URL} = useDatabase();
    const [videos, setVideos] = useState([]);

    const [selectedVideo, setSelectedVideo] = useState(null);

    const page = useRef(0);
    const hasNext = useRef(true)

    const [loading, setLoading] = useState(false);
    const [offline, setOffline] = useState(false);

    const [deletionTrigger, setDeletionTrigger] = useState(0);
    const [scrollAnimation, setScrollAnimation] = useState(true);
    
    const fetchAllVideos = async (pageNum = 1,limit) => {
       // console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
       try{
        const urlResponse = await fetch(`${SERVER_URL}/api/server/videos?page=${pageNum}&limit=${limit}`);
        const urlData = await urlResponse.json()

        hasNext.current = urlData.hasNext

        const normolizeName = (name) => name.replace(/\.mp4$/i, '');
        const newFormPage = urlData.videos.map(u => {
            if(!u.thumbnail || u.thumbnail === ''){
                u.thumbnail = null
            }
            const urlName = normolizeName(u.name);
            const foundDBVideo = videoTable.get(urlName)
            //if(foundDBVideo){console.log("foundDBVideo: ",foundDBVideo)}
            //const test = videoTable.get('블루아카이브 애니메이션');
            //console.log("test :" ,test)
            return{
                id: foundDBVideo ? foundDBVideo.id : null,
                name: u.name,
                url: u.url,
                thumbnail: u.thumbnail,
                duration: foundDBVideo ? foundDBVideo.duration : null,
                isitunique: foundDBVideo ? foundDBVideo.isitunique : false,
            }
        });
        console.log('Loaded page ', pageNum, 'items:', newFormPage.length);
        const idArr = []
        for(const video of newFormPage){
            idArr.push(video.id)
        }
        console.log("IdArray :" ,idArr)
        return newFormPage 

        }catch(err){
            console.log("Error merging videos : ", err)
            
            setOffline(true);
        }finally{
            setLoading(false);
        }
    }

    const loadMore = async () => {
        if(loading || !hasNext.current) return;
        const INITIAL_BATHC_LIMIT = 10;
        const STANDARD_BATHC_LIMIT = 10;

        const nextPage = page.current + 1;
        //if(!hasNext.current) return;
        setLoading(true);

        try{
            if(hasNext.current && nextPage <= 1){
                const newFormPage = await fetchAllVideos(nextPage,INITIAL_BATHC_LIMIT)
                page.current = Math.floor(INITIAL_BATHC_LIMIT / 10);
                updateVideo(newFormPage)
            }else{
                //console.log("SlowerPase")
                const newFormPage = await fetchAllVideos(nextPage,STANDARD_BATHC_LIMIT)
                page.current = nextPage;
                updateVideo(newFormPage)
            }
        }catch(err){
            console.error("Error in loadMore: ",err)
        }    
    };

    const updateVideo = (vids) =>{
        if(!vids || vids.length === 0){
            return null;
        }
        setVideos(prev => {
            const combined = [...prev, ...vids]
            return combined.filter((video, index,self)=>
                video !== null && self.findIndex(v => v.url === video.url) === index
            )
            /*
            const existingIds = new Set(prev.map(p => p.url));
            const unique = vids.filter(v => !existingIds.has(v.url));
            //const combined = [...prev, ...unique];
            //const sortedAll = combined.sort((a,b) => b.id - a.id)
            //return sortedAll;
            return [...prev, ...unique];
            */
        });
    }
  
    const keyExtractor = item => (item.id ? item.id.toString() : item.url);

    const {saveVideoData} = useSaveVideo();
   
    const renderItem = useCallback (({item}) => (
        <RenderItem
            item={item}
            setScrollAnimation={setScrollAnimation}
            setSelectedVideo={setSelectedVideo}
            setDeletionTrigger={setDeletionTrigger}
            deletionTrigger={deletionTrigger}
        />
    ),[deletionTrigger])
    
    const videoWithNoDuration = videos.find(v => !v.duration);
    //console.log(videos.map(video => video.id))
    return(
        <View style={{height:'100%',width:"100%"}}>
            {videoWithNoDuration && (
                <DurationFetcher
                    key={videos.find(v => !v.duration).url}
                    url={videos.find(v => !v.duration).url}
                    onDurationReady={(dur)=>{
                        //const target = videos.find(v => !v.duration);
                        saveVideoData(videoWithNoDuration.id, dur);
                        setVideos(prev =>
                            prev.map(v=>
                                v.url === videoWithNoDuration.url ? {...v, duration: dur} : v
                            )
                        );
                    }}
                />
            )}
            {offline && 
                <ServerLoading/>
            }
            <FlatList
                style={{flex:1}}
                contentContainerStyle={{paddingBottom: 105}}
                data={videos}
                scrollEnabled={scrollAnimation}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={11}
                getItemLayout={(data,index) => (
                    {length: 88, offset: 88 * index, index}
                )}
                ListFooterComponent={
                    loading ? (
                    <View style={{height:60, justifyContent:'center',alignItems:'center'}}>
                        <Text style={{textAlign:'center',fontWeight:'600',fontSize:20}}>loading...</Text>
                    </View>
                    ) : null
                }
            />
            <VideoPlayer setSelectedVideo={setSelectedVideo} selectedVideo={selectedVideo}/>
        </View>
    )
};

