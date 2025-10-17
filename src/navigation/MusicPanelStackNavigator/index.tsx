import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import MusicAuth from '../../screens/MusicPanel/MusicAuth';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const MusicPanelStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.MUSIC_AUTH} component={MusicAuth} />
        </Stack.Navigator>
    );
}

export default MusicPanelStackNavigator