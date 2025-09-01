import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";

export default DataFetch = () => {
    const [videos, setVideos] = useState([]);

    useEffect(()=>{
        fetch("http://192.168.0.2:3001/videos")
        .then((res) => res.json())
        .then((data) => setVideos(data))
        
        .catch((err) => console.log("DB error: ", err))
        
    },[]);

    

    return(
        <View style={{flex:1, padding: 10, position:'absolute'}}>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <View style={{marginBottom:2}}>
                        <Image 
                            source={{uri: item.thumbnail}}
                            style={{width: "100%", height: 10}}
                            resizeMode="cover"
                        />
                        <Text style={{fontSize: 18, fontWeight:"bold", color:'red'}}>
                            {item.name}
                        </Text>
                        <Text style={{fontSize: 18, fontWeight:"bold", color:'red'}}>
                           Duration: {item.duration}
                        </Text>
                        <Text style={{fontSize: 18, fontWeight:"bold", color:'red'}}>
                            Category: {item.category}
                        </Text>

                        <Text style={{fontSize: 18, fontWeight:"bold", color:'red'}}>
                            Category: {item.url}
                        </Text>
                        
                    </View>
                )}  
            />
            
        </View>
    )
}