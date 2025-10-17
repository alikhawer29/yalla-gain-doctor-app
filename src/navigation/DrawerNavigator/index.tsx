import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerBar from '../../components/DrawerBar';
import colors from '../../utils/colors';
import { STATUSBAR_HEIGHT } from '../../utils/helper';
import { NAVIGATORS } from '../../utils/routes';
import AvatarStackNavigator from '../AvatarStackNavigator';
import BottomTabNavigator from '../BottomTabNavigator';
import HelpDeskStackNavigator from '../HelpDeskStackNavigator';
import ServiceStackNavigator from '../ServiceStackNavigator';
import WorkoutStackNavigator from '../WorkoutStackNavigator';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false, drawerType: "slide", drawerStyle: { backgroundColor: colors.black, width: "100%", paddingTop: STATUSBAR_HEIGHT, } }} drawerContent={(props) => <DrawerBar {...props} />} >
            <Drawer.Screen name={NAVIGATORS.BOTTOM} component={BottomTabNavigator} />
            <Drawer.Screen name={NAVIGATORS.SERVICE_STACK} component={ServiceStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.HELP_DESK_STACK} component={HelpDeskStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.WORKOUT_STACK} component={WorkoutStackNavigator} />
            <Drawer.Screen name={NAVIGATORS.AVATAR_STACK} component={AvatarStackNavigator} />
        </Drawer.Navigator>
    );
}

export default DrawerNavigator