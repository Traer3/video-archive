import { View, StyleSheet, Text, Dimensions, Pressable, ScrollView,  } from "react-native"
import YTAssembler from "./YTAssembler";

export default  function SwipeArea({areaState}) {

    const onAreaPress = () =>{
        areaState(false)
    }

    return(
        <View style={{borderWidth:0.1}} >
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
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        margin:'8%',
        overflow:'visible',
        
    },
    
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',
        
    }
    

})