import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import PaymentLogs from '../../screens/PaymentLogs';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const PaymentLogsStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.PAYMENT_LOGS} component={PaymentLogs} />
        </Stack.Navigator>
    );
};

export default PaymentLogsStackNavigator;
