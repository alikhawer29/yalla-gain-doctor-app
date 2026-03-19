import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../../hooks';
import { AppStackParamList } from '../../interfaces';
import { selectLoggedIn } from '../../redux/Slices/AuthSlice';
import Chatbot from '../../screens/Chatbot';
import { NAVIGATORS, ROUTES } from '../../utils/routes';
import AuthStackNavigator from '../AuthStackNavigator';
import DrawerNavigator from '../DrawerNavigator';
import Options from '../Options';
import ServiceDetails from '../../screens/ServiceDetails';
import Slots from '../../screens/Slots';
import Notification from '../../screens/Notification';
import PaymentLogs from '../../screens/PaymentLogs';
import WithdrawAmount from '../../screens/WithdrawAmount';

const Stack = createStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {

    const authenticated = useAppSelector(selectLoggedIn)

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {
                authenticated ?
                    <>
                        <Stack.Screen name={NAVIGATORS.DRAWER} component={DrawerNavigator} />
                        <Stack.Screen name={ROUTES.SLOTS} component={Slots} options={Options} />
                        <Stack.Screen name={ROUTES.NOTIFICATION} component={Notification} options={Options} />
                        <Stack.Screen name={ROUTES.PAYMENT_LOGS} component={PaymentLogs} options={Options} />
                        <Stack.Screen name={ROUTES.WITHDRAW_AMOUNT} component={WithdrawAmount} options={Options} />
                    </>
                    :
                    <Stack.Screen name={NAVIGATORS.AUTH_STACK} component={AuthStackNavigator} />
            }
        </Stack.Navigator>
    );
}

export default AppStackNavigator