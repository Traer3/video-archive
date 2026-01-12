import { View, StyleSheet, Pressable,} from "react-native"
import YTAssembler from "./YTAssembler";

export default function SwipeArea({areaState}) {

    const onAreaPress = async () =>{
        areaState(false)
       
    }    
    return(
        <View style={{
            //borderWidth:0.1,
            borderWidth:1,
            borderColor:'red',
            }} >
          <Pressable style={styles.outerArea} onPress={onAreaPress}/>
            <View style={styles.conteiner}>
                <YTAssembler />          
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        flexGrow:1,
        width:'84%',
        //width:'100%',
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        margin:'8%',
        //marginBottom:'8%',
        overflow:'visible',
        
    },
    
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',   
    }
})