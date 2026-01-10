import { useVideoPlayer } from "expo-video";
import { useEffect } from "react";

export function DurationFetcher({url, onDurationReady}){

    const VideoUrl = String(url)

    const player = useVideoPlayer(VideoUrl, 
        (player) => {
            player.muted = true;
            player.loop = false;
            player.play();
    });

    useEffect(()=>{
        if(!player) return;

        const check = setInterval(()=>{
            if(player?.duration && player.duration > 0){
                const totalSec = Math.floor(player.duration);
                const minutes = Math.floor(totalSec / 60);
                const seconds = totalSec % 60;
                const formatted = `${minutes}:${seconds.toString().padStart(2,"0")}`
                onDurationReady(formatted);
                clearInterval(check);
            }
        },300);

        return ()  => clearInterval(check);

    },[player]);

    return null;
}