import { Image, Pressable,ImageBackground, StyleSheet } from "react-native"
import CheckButton from "./buttonIcons/check-button.png"
import DeleteButton from "./buttonIcons/delete-button.png"
import More from "./buttonIcons/more.png"


const icons = {
    checkButton : CheckButton,
    deleteButton: DeleteButton,
    more : More,
}

export default function ToolButton ({buttonFunction, iconName})  {
    return(
        <>
       
            {iconName && 
                <ImageBackground
                    source={icons[iconName]}
                    style={styles.image}
                    resizeMode="contain"
                >
                     {buttonFunction && 
                        <Pressable
                            onPress={buttonFunction}
                            style={styles.presArea}
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
        width:40, 
        height:40,
        //borderColor:'green',
        //borderWidth:2
    },
    presArea:{
        borderRadius: 2,
        width:40, 
        height:40,
        //borderColor:'red',
        //borderWidth:2,
        backgroundColor:'transparent'
        //backgroundColor:'rgba(0,0,0,0.1)', // это не прозрачность , а затемнение 
    }

})