import { View, StyleSheet, Text, Image } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'

export default function YTVidForm({thumbnail, name, date , duration}) {
    return(
        <View style={styles.baseForm}>
                <Image
                    style={styles.imageStyle}
                    source={thumbnail}
                    resizeMode='stretch'
                />
                <View 
                    style={{
                        marginLeft:3
                    }}>
                    <Text>
                       {name}
                    </Text>
                    <Text>
                        {date}
                    </Text>
                    <Text>
                        {duration}
                    </Text>
                </View>
        </View>
    );
};

const styles = StyleSheet.create({
    baseForm:{
        flex:1,
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        height:'10%',
        width:'99%',
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
        margin:1
        
    },
    imageStyle:{
        borderWidth:1,


        borderRadius:2,
        height:'100%',
        width:'30%'
    }
})