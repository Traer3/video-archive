import { View, StyleSheet, Pressable,} from "react-native"
import YTAssembler from "./YTAssembler";
import { useEffect, useState } from "react";
import { useDatabase } from "../../../DatabaseContext";

export default function SwipeArea() {
    const {SERVER_URL} = useDatabase();

    const [dbVideos,setDbVideos] = useState([]);   
    const [showVideos, setShowVideos] = useState(false);
    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${SERVER_URL}/api/server/videoList`);
                const arr = await res.json();
                const formatted = arr.data.map(v => ({
                    id: v.id,
                    name: v.name,
                    //tumbnail: v.thumbnail,
                    duration: v.duration,
                    category: v.category,
                    isitunique: v.isitunique,
                    filtered: v.filtered
                }));
                const filtered = formatted.filter(vid => vid.filtered === false)
                //const reverseExistedList = [...YTvideos].reverse()
                //const reversVideoList = [...filtered].reverse()
                setDbVideos(filtered);
    
                console.log('DB videos loaded:',formatted.length);
            }catch(err){
                console.log("Error loading DB videos:", err);
            }finally{
                setShowVideos(true)
            }
        };
        getDBData();
 
    },[])

    return(
        <View style={{
            justifyContent:'center',
            alignItems:'center',
            }} >
            <View style={styles.conteiner}>
                {showVideos && <YTAssembler dbVideos={dbVideos}/>}          
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        flexGrow:1,
        width:'79%',
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        overflow:'visible',
        padding:2,
        borderRadius:2,
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
        //borderWidth:3,
        //borderColor:'yellow',
    },
    
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',   
    }
})