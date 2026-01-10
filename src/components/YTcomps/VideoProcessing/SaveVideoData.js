import { useRef } from "react";
const DB_URL = 'http://192.168.0.8:3001';

export const useSaveVideo = () =>{
    const savedIds = useRef(new Set());
    
    const saveVideoData = async (vidId, vidDuration) =>{
        if(!vidId || vidId === 0) return;
        
        if(!vidDuration){
            console.log("⚠️ Video duration is null or undefined")
            return;
        }

        try{
            if(savedIds.current.has(vidId)){
                console.log(`⏭ Video ${vidId} already saved, skipping...`);
                return;
            }

            const res = await fetch(`${DB_URL}/saveVidDuration`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    vidId: vidId,
                    vidDurationData: vidDuration,
                }),
            });

            if(!res.ok){
                throw new Error(`Server error:  ${res.status}`);
            }

            const data = await res.json();
            savedIds.current.add(vidId);
            console.log(`⏱ Duration saved for video ${vidId} : ${vidDuration}`)
            console.log("✅Updated video: ", data.updatedVideo);
                    
        }catch(err){
            console.error('❌ Error saving video: ', err);
        }
    }
    return {saveVideoData};
}


