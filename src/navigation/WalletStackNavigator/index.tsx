import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../interfaces';
import Wallet from '../../screens/Wallet';
import { ROUTES } from '../../utils/routes';
import Options from '../Options';

const Stack = createStackNavigator<RootStackParamList>();

const WalletStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={Options}>
            <Stack.Screen name={ROUTES.WALLET} component={Wallet} />
        </Stack.Navigator>
    );
}

export default WalletStackNavigator
