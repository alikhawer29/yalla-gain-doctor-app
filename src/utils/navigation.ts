// navigation.ts
import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { AppStackParamList, AuthStackParamList, RootStackParamList } from '../interfaces';
import { NAVIGATORS, ROUTES } from './routes';

type CombinedParamList = RootStackParamList & AuthStackParamList & AppStackParamList;

export const navigationRef = createNavigationContainerRef<CombinedParamList>();

export const navigate = <RouteName extends keyof CombinedParamList>(
    name: RouteName,
    params?: undefined extends CombinedParamList[RouteName]
        ? CombinedParamList[RouteName] | undefined
        : CombinedParamList[RouteName]
) => {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
};

export const goBack = () => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.goBack());
    }
};

/** Drawer → bottom tab → profile stack root (pops Edit Profile / Change Password, selects profile tab). */
export const navigateToMyProfileTab = () => {
    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
        CommonActions.navigate({
            name: NAVIGATORS.DRAWER as keyof CombinedParamList,
            params: {
                screen: NAVIGATORS.BOTTOM,
                params: {
                    screen: NAVIGATORS.MY_PROFILE_STACK,
                    params: { screen: ROUTES.MY_PROFILE },
                },
            },
        } as never),
    );
};

/** Drawer → Progress Tracking stack (screen was never mounted under Bottom tabs). */
export const navigateToProgressTracking = (id?: string | number) => {
    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
        CommonActions.navigate({
            name: NAVIGATORS.DRAWER as keyof CombinedParamList,
            params: {
                screen: NAVIGATORS.PROGRESS_TRACKING_STACK,
                params: {
                    screen: ROUTES.PROGRESS_TRACKING,
                    params: id != null ? { id } : undefined,
                },
            },
        } as never),
    );
};

export const navigateAndSimpleReset = <RouteName extends keyof CombinedParamList>(
    name: RouteName,
    index: number = 0,
    params?: undefined extends CombinedParamList[RouteName]
        ? CombinedParamList[RouteName] | undefined
        : CombinedParamList[RouteName]
) => {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index,
                routes: [{ name, params }],
            }),
        );
    }
};
