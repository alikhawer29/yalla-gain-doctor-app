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
import WithdrawAmount from '../../screens/WithdrawAmount';
import Beneficiaries from '../../screens/Beneficiaries';
import AddBeneficiary from '../../screens/AddBeneficiary';
import WithdrawBeneficiary from '../../screens/WithdrawBeneficiary';
import WalletTransactionLogs from '../../screens/WalletTransactionLogs';

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
                        <Stack.Screen name={ROUTES.WITHDRAW_AMOUNT} component={WithdrawAmount} options={Options} />
                        <Stack.Screen name={ROUTES.BENEFICIARIES} component={Beneficiaries} options={Options} />
                        <Stack.Screen name={ROUTES.ADD_BENEFICIARY} component={AddBeneficiary} options={Options} />
                        <Stack.Screen name={ROUTES.WITHDRAW_BENEFICIARY} component={WithdrawBeneficiary} options={Options} />
                        <Stack.Screen name={ROUTES.WALLET_TRANSACTION_LOGS} component={WalletTransactionLogs} options={Options} />
                    </>
                    :
                    <Stack.Screen name={NAVIGATORS.AUTH_STACK} component={AuthStackNavigator} />
            }
        </Stack.Navigator>
    );
}

export default AppStackNavigator