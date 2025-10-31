import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import AppointmentRequests from '../../screens/AppointmentRequests';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';
import BookingDetails from '../../screens/BookingDetails';
import ServiceLogs from '../../screens/ServiceLogs';
import RescheduleBooking from '../../screens/RescheduleBooking';
import ReportBooking from '../../screens/ReportBooking';
import UserHistory from '../../screens/UserHistory';

const Stack = createStackNavigator<RootStackParamList>();

const BookingStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.SERVICE_LOGS} component={ServiceLogs} />
            <Stack.Screen name={ROUTES.APPOINTMENT_REQUESTS} component={AppointmentRequests} />
            <Stack.Screen name={ROUTES.BOOKING_DETAILS} component={BookingDetails} />
            <Stack.Screen name={ROUTES.RESCHEDULE_BOOKING} component={RescheduleBooking} />
            <Stack.Screen name={ROUTES.REPORT_BOOKING} component={ReportBooking} />
            <Stack.Screen name={ROUTES.USER_HISTORY} component={UserHistory} />
        </Stack.Navigator>
    );
}

export default BookingStackNavigator