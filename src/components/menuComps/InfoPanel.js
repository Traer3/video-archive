import { View, StyleSheet,  } from "react-native";
import InfoForm from "./InfoForm";

export default function InfoPanel () {
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