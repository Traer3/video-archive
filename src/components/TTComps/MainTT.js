import { StyleSheet } from "react-native";
import { View, Image,Pressable,Text } from "react-native";
import {useRef, useState } from "react";
import bratty from "../../meme/arona.gif"
import shareIcon from "../../../assets/share.png"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";



export default function MainTT () {
    const [buttonTest, setButtonTest] = useState(0);
    
    const [data, setData] = useState([
        {id: "1", title: "Cunt1"},
        {id: "1", title: "Cunt2"},
        {id: "1", title: "Cunt3"},
        {id: "1", title: "Cunt4"},
    ]);

    const deleteItem = (id) => {
        setData((prev)=> prev.filter((item)=>  item.id !== id));
    };

    const RightActions = () =>{
        return(
            <View style={styles.deleteBox}>
                <Text style={styles.deleteText}>Delete</Text>
            </View>
        );
    };
    
    const renderItem = ({items}) => (
        <Swipeable>
            
        </Swipeable>
    )

        return(
            <View style={styles.main}>
                
                <View 
                style={{
                    borderColor:"green",
                    backgroundColor:'rgb(71, 103, 151)',
                    borderWidth:4,
                    alignItems:'center',
                    

                    height:"90%",
                    width:'90%',
                    marginTop:"10%",
                    marginLeft:"5%",
                    zIndex:1,
                }}>

                    
                </View>
            </View>
        );
};

const styles = StyleSheet.create({
    main:{
        position:'absolute',
        width:'100%',
        height: '92%',
        borderWidth:1,
        borderColor:'red',
        
    },
    baseForm:{
        position:"absolute",
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
        height:'10%',
        width:'70%',

        marginTop:'2%',
        
    },
    imageStyle:{
        borderWidth:0.3,
        borderRadius:2,
        
        height:'100%',
        width:'40%'
    }
})