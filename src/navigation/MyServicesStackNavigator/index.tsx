import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import MyServices from '../../screens/MyServices';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';
import ServiceDetails from '../../screens/ServiceDetails';

const Stack = createStackNavigator<RootStackParamList>();

const MyServicesStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.MY_SERVICES} component={MyServices} />
        </Stack.Navigator>
    );
}

export default MyServicesStackNavigator