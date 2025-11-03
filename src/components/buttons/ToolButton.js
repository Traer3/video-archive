import {Pressable,ImageBackground, StyleSheet } from "react-native"
import CheckButton from "./buttonIcons/check-button.png"
import DeleteButton from "./buttonIcons/delete-button.png"
import More from "./buttonIcons/more.png"
import Def from "../../meme/arona.gif"


const icons = {
    checkButton : CheckButton,
    deleteButton: DeleteButton,
    more : More,
    def: Def,
}

export default function ToolButton ({buttonFunction, iconName,CHeight, CWidth})  {

    const iconsSource = icons[iconName];
    if(!iconsSource) {
        console.warn(`Unknow icon name: ${iconName}`)
        return null;
    }

    return(
        <>
       
            {iconName && 
                <ImageBackground
                    source={icons[iconName] || icons.def}
                    style={[styles.image, {
                        width : CWidth ? CWidth : 40,
                        height: CHeight ? CHeight : 40,
                    }]}
                    resizeMode="contain"
                >
                     {buttonFunction && 
                        <Pressable
                            onPress={buttonFunction}
                            style={[styles.presArea, {
                                width : CWidth ? CWidth : 40,
                                height: CHeight ? CHeight : 40,
                            }]}
                        >
                            
                        </Pressable>
                    }
                </ImageBackground>
            }
        
        </>
    )
}
const styles = StyleSheet.create({
    image:{
        
        
        //borderColor:'green',
        //borderWidth:2
    },
    presArea:{
        borderRadius: 2,
        
        //borderColor:'red',
        //borderWidth:2,
        backgroundColor:'transparent'
        //backgroundColor:'rgba(0,0,0,0.1)', // это не прозрачность , а затемнение 
    }

})