import { View, Modal, TouchableOpacity, StyleSheet} from "react-native";
import { VideoView, useVideoPlayer, } from "expo-video";


export default function VideoPlayer({setSelectedVideo, selectedVideo}) {
    
    const player = useVideoPlayer(
        selectedVideo,
        (player) => {
            player.loop = false
            player.play();
            player.audioMixingMode='mixWithOthers'
        }
    );

    return(
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
    )
}

const styles = StyleSheet.create({
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
})