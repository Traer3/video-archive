import { useVideoPlayer } from "expo-video";
import { useEffect } from "react";


export function DurationFetcher({url, onDurationReady}){

    const VideoUrl = String(url)

    const player = useVideoPlayer(VideoUrl);

    useEffect(()=>{
        let attemps = 0;
        const check = setInterval(()=>{
            attemps++;

            if(player?.status === "readyToPlay" && player.duration > 0){
                const durationMs =  player.duration;
                const totalSec = Math.floor(durationMs / 1000);
                const minutes = Math.floor(totalSec / 60);
                const seconds = totalSec % 60;
                const formatted = `${minutes}:${seconds.toString().padStart(2,"0")}`
                onDurationReady(formatted);
                clearInterval(check);
            }

            if(attemps > 100){
                clearInterval(check);
                onDurationReady("0:00");
            }

        },300);

        return ()=> clearInterval(check);
    },[player]);

    return null;
}