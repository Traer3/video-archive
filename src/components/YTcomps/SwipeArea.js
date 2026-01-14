import { View, StyleSheet, Pressable,} from "react-native"
import YTAssembler from "./YTAssembler";

export default function SwipeArea() {   
    return(
        <View style={{
            //borderWidth:0.1,
            //borderWidth:3,
            //borderColor:'green',
            justifyContent:'center',
            alignItems:'center',
            }} >
            <View style={styles.conteiner}>
                <YTAssembler />          
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        flexGrow:1,
        width:'79%',
        //width:'100%',
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        //margin:'8%',
        //marginBottom:'8%',
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