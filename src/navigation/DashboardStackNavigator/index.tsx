import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Dashboard from '../../screens/Dashboard';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const DashboardStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.DASHBOARD} component={Dashboard} />
        </Stack.Navigator>
    );
}

export default DashboardStackNavigator;
