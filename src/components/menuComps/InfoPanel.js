import { View, StyleSheet,  } from "react-native";
import InfoForm from "./InfoForm";
import { useEffect, useState } from "react";

const DB_URL = 'http://192.168.0.8:3001';

export default function InfoPanel () {
    const [SQLInfo, setSQLInfo] = useState(false);

    useEffect(()=>{
        const getDBData = async () => {
            try{
                const res = await fetch(`${DB_URL}/videos`);
                const arr = await res.json();
                setSQLInfo(true);
                console.log('DB videos loaded');
            }catch(err){
                setSQLInfo(false);
                console.log("Error loading DB videos:", err);
            }
        };
        getDBData();
 
    },[])


    return(
        <View style={styles.outerArea}>
            <View style={styles.conteiner}>
                <InfoForm/>
                <InfoForm/>
                <InfoForm/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        
        width:'90%',
        height:'90%',
        backgroundColor:'rgb(71, 103, 151)',
       

        borderRadius:2,
        borderWidth:2,
        borderColor:'rgb(43,75,123)',

        
        
        //borderWidth:3,
        //borderColor:'yellow',
        alignItems:'center',
        flexDirection:'column',
    },
    
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',   
    }
})