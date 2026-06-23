import { useCallback, useRef, useState } from "react";
import { View, FlatList, Text } from "react-native";
import { DurationFetcher } from "./VideoProcessing/DurationFetcher";
import RenderItem from "./VideoProcessing/RenderItem";
import { useSaveVideo } from "./VideoProcessing/SaveVideoData";
import ServerLoading from "../ServerLoading";
import VideoPlayer from "./VideoPlayer";
import { useDatabase } from "../../../DatabaseContext";

export default function YTAssembler({ videoTable }) {
    const { SERVER_URL } = useDatabase();
    const [videos, setVideos] = useState([]);

    const [selectedVideo, setSelectedVideo] = useState(null);

    const page = useRef(0);
    const hasNext = useRef(true)

    const [loading, setLoading] = useState(false);
    const [offline, setOffline] = useState(false);

    const [deletionTrigger, setDeletionTrigger] = useState(0);
    const [scrollAnimation, setScrollAnimation] = useState(true);

    const fetchAllVideos = async (pageNum = 1, limit) => {
        try {
            const urlResponse = await fetch(`${SERVER_URL}/api/server/videos?page=${pageNum}&limit=${limit}`);
            const urlData = await urlResponse.json()

            hasNext.current = urlData.hasNext

            const newFormPage = []
            for (const video of urlData.videos) {
                if (!video.thumbnail || video.thumbnail === '') {
                    video.thumbnail = null
                }
                const foundDBVideo = videoTable.get(video.name)
                if (!foundDBVideo || foundDBVideo === undefined) {
                    continue;
                }
                newFormPage.push({
                    id: foundDBVideo ? foundDBVideo.id : null,
                    name: video.name,
                    url: video.url,
                    thumbnail: video.thumbnail,
                    duration: foundDBVideo ? foundDBVideo.duration : null,
                    isitunique: foundDBVideo ? foundDBVideo.isitunique : false,
                })
            }
            console.log('Loaded page ', pageNum, 'items:', newFormPage.length);
            return newFormPage

        } catch (err) {
            console.log("Error merging videos : ", err)
            setOffline(true);
        } finally {
            setLoading(false);
        }
    }

    const loadMore = async () => {
        if (loading || (!hasNext.current && page.current > 0)) return;
        const STANDARD_BATHC_LIMIT = 10;

        const nextPage = page.current + 1;
        page.current = nextPage;
        setLoading(true);
        try {
            const newFormPage = await fetchAllVideos(nextPage, STANDARD_BATHC_LIMIT)

            if (newFormPage && newFormPage.length > 0) {
                updateVideo(newFormPage);
                setLoading(false);
                if (newFormPage.length < STANDARD_BATHC_LIMIT && hasNext.current) {
                    setLoading(false);
                    return loadMore()
                } else {
                    setLoading(false);
                }
            }

            else if (!newFormPage || newFormPage.length === 0) {
                setLoading(false);
                hasNext.current = true;
                return loadMore()
            }
            else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Error in loadMore: ", err)
            setLoading(false);
        }
    };

    const updateVideo = (vids) => {
        if (!vids || vids.length === 0) {
            return null;
        }
        setVideos(prev => {
            const combined = [...prev, ...vids]
            return combined.filter((video, index, self) =>
                video !== null && self.findIndex(v => v.url === video.url) === index
            )
        });
    }

    const keyExtractor = item => (item.id ? item.id.toString() : item.url);

    const { saveVideoData } = useSaveVideo();

    const renderItem = useCallback(({ item }) => (
        <RenderItem
            item={item}
            setScrollAnimation={setScrollAnimation}
            setSelectedVideo={setSelectedVideo}
            setDeletionTrigger={setDeletionTrigger}
            deletionTrigger={deletionTrigger}
        />
    ), [deletionTrigger])

    const videoWithNoDuration = videos.find(v => !v.duration);
    return (
        <View style={{ height: '100%', width: "100%" }}>
            {videoWithNoDuration && (
                <DurationFetcher
                    key={videos.find(v => !v.duration).url}
                    url={videos.find(v => !v.duration).url}
                    onDurationReady={(dur) => {
                        saveVideoData(videoWithNoDuration.id, dur);
                        setVideos(prev =>
                            prev.map(v =>
                                v.url === videoWithNoDuration.url ? { ...v, duration: dur } : v
                            )
                        );
                    }}
                />
            )}
            {offline &&
                <ServerLoading />
            }
            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 105 }}
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
                getItemLayout={(data, index) => (
                    { length: 88, offset: 88 * index, index }
                )}
                ListFooterComponent={
                    loading ? (
                        <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 20 }}>loading...</Text>
                        </View>
                    ) : null
                }
            />
            <VideoPlayer setSelectedVideo={setSelectedVideo} selectedVideo={selectedVideo} />
        </View>
    )
};

