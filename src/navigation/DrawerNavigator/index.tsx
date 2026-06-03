import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerBar from '../../components/DrawerBar';
import colors from '../../utils/colors';
import { NAVIGATORS } from '../../utils/routes';
import AvatarStackNavigator from '../AvatarStackNavigator';
import BookingStackNavigator from '../BookingStackNavigator';
import BottomTabNavigator from '../BottomTabNavigator';
import DashboardStackNavigator from '../DashboardStackNavigator';
import HelpDeskStackNavigator from '../HelpDeskStackNavigator';
import ReviewsStackNavigator from '../ReviewsStackNavigator';
import ServiceStackNavigator from '../ServiceStackNavigator';
import WorkoutStackNavigator from '../WorkoutStackNavigator';
import WalletStackNavigator from '../WalletStackNavigator';
import ProgressTrackingStackNavigator from '../ProgressTrackingStackNavigator';
import PaymentLogsStackNavigator from '../PaymentLogsStackNavigator';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerStyle: {
                    backgroundColor: colors.black,
                    width: '100%',
                },
            }}
            drawerContent={props => <DrawerBar {...props} />}
        >
            <Drawer.Screen name={NAVIGATORS.BOTTOM} component={BottomTabNavigator} />
            <Drawer.Screen name={NAVIGATORS.DASHBOARD_STACK} component={DashboardStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.SERVICE_STACK} component={ServiceStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.BOOKING_STACK} component={BookingStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.PAYMENT_LOGS_STACK} component={PaymentLogsStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.REVIEWS_STACK} component={ReviewsStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.HELP_DESK_STACK} component={HelpDeskStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.WORKOUT_STACK} component={WorkoutStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.AVATAR_STACK} component={AvatarStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.WALLET_STACK} component={WalletStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.PROGRESS_TRACKING_STACK} component={ProgressTrackingStackNavigator} />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator