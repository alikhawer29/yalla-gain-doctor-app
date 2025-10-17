import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const AvatarStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
        </Stack.Navigator>
    );
}

export default AvatarStackNavigator