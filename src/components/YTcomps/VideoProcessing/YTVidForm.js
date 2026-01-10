import { View, StyleSheet, Text, Image, Pressable, Share } from "react-native"
import bratty from '../../../meme/arona.gif'
import shareIcon from '../../../../assets/share.png'
//import placeholder from "../../../../assets/AronaServer.jpg"
import * as Clipboard from 'expo-clipboard';
import * as  Haptics from 'expo-haptics';

export default function YTVidForm({thumbnail, name, date , duration,isItUnique,url}) {


    const copyUrlToClipboard = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        try{
            await Clipboard.setStringAsync(url)
            await Share.share({
                message: url,
            });
        }catch(err){
            console.error("Error forwarding url")
        }
        
    }
    
    return(
        <View 
            style={[
                styles.baseForm,{
                    borderColor: isItUnique ? 'red': 'rgb(43,75,123)', 
                }
            ]}
        >
           
            <Image
                style={styles.imageStyle}
                source={thumbnail ? {uri: thumbnail} : bratty}
                resizeMode='stretch'
            />
            <View style={{ marginLeft:3}}>
                    <Text style={{width:'220',}} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>
                    <Text>{date}</Text>
                    <Text> {duration}</Text>
                    <Pressable
                        style={{right:-195,width:"10%"}}
                        onPress={()=>{
                            copyUrlToClipboard()
                            console.log("Vide url: ",url )
                        }}
                    >
                        <Image
                            source={shareIcon}
                            style={{width:20, height:20}}
                            resizeMode="contain"
                        />
                    </Pressable>
            </View>
        </View >   
    );
};

const styles = StyleSheet.create({
    baseForm:{
        flex:1,
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        height:'80',
        borderWidth:2,
        marginTop:8,
        marginRight:10,
    },
    imageStyle:{
        borderWidth:1,
        borderRadius:2,
        height:'100%',
        width:'30%'
    }
});