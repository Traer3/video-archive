import { Image, Pressable } from "react-native"
import CheckButton from "./buttonIcons/check-button.png"
import DeleteButton from "./buttonIcons/delete-button.png"
import More from "./buttonIcons/more.png"

const icons = {
    checkButton : CheckButton,
    deleteButton: DeleteButton,
    more : More,
}

export default function ToolButton ({buttonSetState, buttonState, iconName})  {
    return(
        <Pressable
            onPress={()=> buttonSetState(!buttonState)}
            style={{
                borderRadius: 2,
                backgroundColor:'transparent'
              // backgroundColor:'rgba(0,0,0,0.1)', // это не прозрачность , а затемнение 
            }}
        >
            {iconName && 
                <Image
                    source={icons[iconName]}
                    style={{
                        width:40, 
                        height:40,
                        //borderColor:'green',
                        //borderWidth:2
                    }}
                    resizeMode="contain"
                />
            }
        </Pressable>
    )
}