import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import images from '../../assets/images';
import BottomBar from '../../components/BottomBar';
import { NAVIGATORS } from '../../utils/routes';
import ChatStackNavigator from '../ChatStackNavigator';
import HomeStackNavigator from '../HomeStackNavigator';
import MyProfileStackNavigator from '../MyProfileStackNavigator';
import MyServicesStackNavigator from '../MyServicesStackNavigator';
import WalletStackNavigator from '../WalletStackNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, animation: "fade" }} tabBar={props => <BottomBar {...props} />}>
            <Tab.Screen name={NAVIGATORS.HOME_STACK} component={HomeStackNavigator} options={{ tabBarIcon: images.tab_home }} />
            <Tab.Screen name={NAVIGATORS.MY_SERVICES_STACK} component={MyServicesStackNavigator} options={{ tabBarIcon: images.tab_gallery }} />
            <Tab.Screen name={NAVIGATORS.WALLET_STACK} component={WalletStackNavigator} options={{ tabBarIcon: images.helpdesk.wallet }} />
            <Tab.Screen name={NAVIGATORS.CHAT_STACK} component={ChatStackNavigator} options={{ tabBarIcon: images.tab_chat }} />
            <Tab.Screen name={NAVIGATORS.MY_PROFILE_STACK} component={MyProfileStackNavigator} options={{ tabBarIcon: images.tab_profile }} />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator