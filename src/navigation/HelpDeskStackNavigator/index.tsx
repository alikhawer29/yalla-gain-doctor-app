import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import HelpDesk from '../../screens/HelpDesk';
import Subscription from '../../screens/Subscription';
import SubscriptionLogs from '../../screens/SubscriptionLogs';
import FAQ from '../../screens/FAQ';
import AboutUs from '../../screens/AboutUs';
import ChooseLanguage from '../../screens/ChooseLanguage';
import BasicDetails from '../../screens/BasicDetails';
import ContactUs from '../../screens/ContactUs';
import Chatbot from '../../screens/Chatbot';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const HelpDeskStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.HELP_DESK} component={HelpDesk} />
            <Stack.Screen name={ROUTES.SUBSCRIPTION} component={Subscription} />
            <Stack.Screen name={ROUTES.SUBSCRIPTION_LOGS} component={SubscriptionLogs} />
            <Stack.Screen name={ROUTES.FAQ} component={FAQ} />
            <Stack.Screen name={ROUTES.ABOUT_US} component={AboutUs} />
            <Stack.Screen name={ROUTES.CHOOSE_LANGUAGE} component={ChooseLanguage} />
            <Stack.Screen name={ROUTES.BASIC_DETAILS} component={BasicDetails} />
            <Stack.Screen name={ROUTES.CONTACT_US} component={ContactUs} />
            <Stack.Screen name={ROUTES.CHATBOT} component={Chatbot} />
        </Stack.Navigator>
    );
}

export default HelpDeskStackNavigator