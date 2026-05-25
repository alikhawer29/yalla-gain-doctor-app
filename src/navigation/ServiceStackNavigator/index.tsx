import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../../hooks';
import { RootStackParamList } from '../../interfaces';
import { selectServiceStackKey } from '../../redux/Slices/NavigationSlice';
import AddService from '../../screens/AddService';
import Categories from '../../screens/Categories';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';
import ServiceDetails from '../../screens/ServiceDetails';

const Stack = createStackNavigator<RootStackParamList>();

const ServiceStackNavigator = () => {
    const stackKey = useAppSelector(selectServiceStackKey);

    return (
        <Stack.Navigator key={`service-stack-${stackKey}`} screenOptions={Options}>
            <Stack.Screen name={ROUTES.CATEGORIES} component={Categories} />
            <Stack.Screen name={ROUTES.ADD_SERVICE} component={AddService} />
            <Stack.Screen name={ROUTES.SERVICE_DETAILS} component={ServiceDetails} />
        </Stack.Navigator>
    );
}

export default ServiceStackNavigator