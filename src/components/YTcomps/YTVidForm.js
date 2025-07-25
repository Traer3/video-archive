import { View, StyleSheet, Text, Image } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'

export default function YTVidForm() {
    return(
        <View style={styles.baseForm}>
                <Image
                    style={styles.imageStyle}
                    source={creature}
                    resizeMode='stretch'
                />
                <View 
                    style={{
                        marginLeft:3
                    }}>
                    <Text>
                        Name
                    </Text>
                    <Text>
                        Date
                    </Text>
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    baseForm:{
        display:'flex',
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        height:'9%',
        width:'99%',
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
        margin:1
        
    },
    imageStyle:{
        borderWidth:1,
        borderColor:'red',

        borderRadius:4,
        height:'99%',
        width:'45%'
    }
})