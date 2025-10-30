import { Image, Pressable } from "react-native"
import CheckButton from "./buttonIcons/check-button.png"
import DeleteButton from "./buttonIcons/delete-button.png"
import More from "./buttonIcons/more.png"

const icons = {
    checkButton : CheckButton,
    deleteButton: DeleteButton,
    more : More,
}

export default ToolButton = ({buttonSetState, buttonState, iconName}) => {
    return(
        <Pressable
            onPress={()=> buttonSetState(!buttonState)}
            style={{
                borderRadius: 2,
                backgroundColor:'rgba(0,0,0,0.1)',
            }}
        >
            {iconName && 
                <Image
                    source={icons[iconName]}
                    style={{width:20, height:20}}
                    resizeMode="contain"
                />
            }
        </Pressable>
    )
}