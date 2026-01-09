import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useState } from "react";


export default function SoundEffect() {
    const player = useAudioPlayer(require('../../../assets/0103.mp3'));
    const status = useAudioPlayerStatus(player);
    if(player){
        console.log("PlayerCreated");
    }
    
    const playSound = () =>{
        if(!player || !status.isLoaded) return;

        console.log("PlayerColdStart");
       
            player.seekTo(0);
            //player.volume = 0.5;
            player.play();
            console.log("Sound Finished");
       
    }

    useEffect(()=>{
        console.log("Player status", status.didJustFinish)
        
        if(status.didJustFinish){
            player.release();
            console.log("Player RELEASE")
        }
    },[status])

    return playSound;
}