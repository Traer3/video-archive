import { View, StyleSheet, Pressable, } from "react-native"
import YTAssembler from "./YTAssembler";
import { useEffect, useState } from "react";
import { useDatabase } from "../../../DatabaseContext";

export default function SwipeArea() {
    const { SERVER_URL, loading } = useDatabase();

    const [showVideos, setShowVideos] = useState(false);
    const [videoTable, setVideoTable] = useState(()=> new Map());
    useEffect(() => {
        const getDBData = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/api/server/YTVideos`);
                const arr = await res.json();
                const localTable = new Map();
                arr.data.forEach(video => {
                    localTable.set(video.name, video)
                })
                
                setVideoTable(localTable);
                if(localTable.size > 0){
                    setShowVideos(true)
                }

                console.log('DB videos loaded:', localTable.size);
            } catch (err) {
                console.log("Error loading DB videos:", err);
                return []
            }
        };
        getDBData();

    }, [])
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
        }} >
            {!loading &&
                <View style={styles.conteiner}>
                    {showVideos && <YTAssembler videoTable={videoTable}/>}
                </View>
            }

        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        flexGrow: 1,
        width: '79%',
        height: '100%',
        backgroundColor: 'rgb(71, 103, 151)',
        overflow: 'visible',
        padding: 2,
        borderRadius: 2,
        borderWidth: 2,
        borderColor: 'rgb(43,75,123)',
        //borderWidth:3,
        //borderColor:'yellow',
    },

    outerArea: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    }
})