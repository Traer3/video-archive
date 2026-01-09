import { useEffect } from "react";
import { useVideoPlayer, } from "expo-video";


export default function SoundEffect() {
    const track = require('../../../assets/0103.mp3')
    const player = useVideoPlayer(track, (player) => {
            //console.log("Player Work!")
            player.loop = false;
            player.audioMixingMode='mixWithOthers'
    });
    /* если видео не работают , значит кэш забит ебучими плеирами со звуком
    useEffect(()=>{
        return()=>{
            console.log("Player released!")
            player?.release?.();
            
        }
    },[])
    */
    return player;
}