// navigation.ts
import {
    CommonActions,
    StackActions,
    createNavigationContainerRef,
    type NavigationState,
    type PartialState,
} from '@react-navigation/native';
import { AppStackParamList, AuthStackParamList, RootStackParamList } from '../interfaces';
import { NAVIGATORS, ROUTES } from './routes';

type CombinedParamList = RootStackParamList & AuthStackParamList & AppStackParamList;

export const navigationRef = createNavigationContainerRef<CombinedParamList>();

type DrawerNavigation = {
    navigate: (name: string, params?: object) => void;
};

const findDrawerState = (
    state: NavigationState | PartialState<NavigationState> | undefined,
): NavigationState | undefined => {
    if (!state?.routes) return undefined;
    for (const route of state.routes) {
        if (route.name === NAVIGATORS.DRAWER) {
            return route.state as NavigationState | undefined;
        }
        const nested = findDrawerState(
            route.state as NavigationState | PartialState<NavigationState> | undefined,
        );
        if (nested) return nested;
    }
    return undefined;
};

const homeTabParams = {
    screen: NAVIGATORS.HOME_STACK,
    params: { screen: ROUTES.HOME },
};

const categoriesParams = { screen: ROUTES.CATEGORIES };

const dispatchDrawerToCategories = (drawerNavigation?: DrawerNavigation) => {
    if (drawerNavigation) {
        drawerNavigation.navigate(NAVIGATORS.SERVICE_STACK, categoriesParams);
        return;
    }

    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
        CommonActions.navigate({
            name: NAVIGATORS.DRAWER as keyof CombinedParamList,
            params: {
                screen: NAVIGATORS.SERVICE_STACK,
                params: categoriesParams,
            },
        } as never),
    );
};

/** Reset service stack to Categories only (works when Service Details is index 0). */
const resetServiceStackToCategories = () => {
    if (!navigationRef.isReady()) return;

    const drawerState = findDrawerState(navigationRef.getRootState());
    if (!drawerState?.routes?.length) return;

    const serviceIndex = drawerState.routes.findIndex(
        r => r.name === NAVIGATORS.SERVICE_STACK,
    );
    if (serviceIndex < 0) return;

    const serviceRoute = drawerState.routes[serviceIndex];
    const stackKey = (serviceRoute.state as NavigationState | undefined)?.key;

    if (stackKey) {
        navigationRef.dispatch({
            ...CommonActions.reset({
                index: 0,
                routes: [{ name: ROUTES.CATEGORIES }],
            }),
            target: stackKey,
        });
    }

    if (drawerState.index !== serviceIndex && drawerState.key) {
        navigationRef.dispatch({
            ...CommonActions.reset({
                index: serviceIndex,
                routes: drawerState.routes.map(route => ({
                    name: route.name,
                    ...(route.name === NAVIGATORS.SERVICE_STACK
                        ? { state: { index: 0, routes: [{ name: ROUTES.CATEGORIES }] } }
                        : {}),
                })),
            }),
            target: drawerState.key,
        });
    }
};

/** Switch bottom tab navigator to Home when already on BottomTabNavigator. */
const focusHomeBottomTab = () => {
    if (!navigationRef.isReady()) return;

    const drawerState = findDrawerState(navigationRef.getRootState());
    const bottomRoute = drawerState?.routes?.find(r => r.name === NAVIGATORS.BOTTOM);
    const tabState = bottomRoute?.state as NavigationState | undefined;
    if (!tabState?.key || !tabState.routes?.length) return;

    const homeIndex = tabState.routes.findIndex(r => r.name === NAVIGATORS.HOME_STACK);
    if (homeIndex < 0 || tabState.index === homeIndex) return;

    navigationRef.dispatch({
        ...CommonActions.reset({
            index: homeIndex,
            routes: tabState.routes.map(route => ({
                name: route.name,
                ...(route.name === NAVIGATORS.HOME_STACK
                    ? { state: { index: 0, routes: [{ name: ROUTES.HOME }] } }
                    : {}),
            })),
        }),
        target: tabState.key,
    });
};

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

/**
 * Drawer / global → Bottom tabs → Home.
 * Pass drawer `navigation` from DrawerBar (same pattern as Dashboard / Service Logs).
 */
export const navigateToHomeTab = (drawerNavigation?: DrawerNavigation) => {
    if (drawerNavigation) {
        drawerNavigation.navigate(NAVIGATORS.BOTTOM, homeTabParams);
    } else if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.navigate({
                name: NAVIGATORS.DRAWER as keyof CombinedParamList,
                params: {
                    screen: NAVIGATORS.BOTTOM,
                    params: homeTabParams,
                },
            } as never),
        );
    }

    requestAnimationFrame(() => {
        focusHomeBottomTab();
        requestAnimationFrame(focusHomeBottomTab);
    });
};

/** Bottom tab → My Services list. */
export const navigateToMyServicesTab = () => {
    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
        CommonActions.navigate({
            name: NAVIGATORS.DRAWER as keyof CombinedParamList,
            params: {
                screen: NAVIGATORS.BOTTOM,
                params: {
                    screen: NAVIGATORS.MY_SERVICES_STACK,
                    params: { screen: ROUTES.MY_SERVICES },
                },
            },
        } as never),
    );
};

/** Drawer → Categories (fresh add-service flow). Pass drawer `navigation` from DrawerBar. */
export const navigateToAddServiceCategories = (drawerNavigation?: DrawerNavigation) => {
    dispatchDrawerToCategories(drawerNavigation);

    requestAnimationFrame(() => {
        resetServiceStackToCategories();
    });
};

/** Open service details from My Services; back returns to My Services tab. */
export const navigateToServiceDetailsFromMyServices = (
    id: number,
    title: string,
) => {
    navigateBackToServiceDetails(id, title, true);
};

/** After editing slots (App stack) → pop Slots and open Service Details in drawer. */
export const navigateBackToServiceDetails = (
    id: number,
    title: string,
    fromMyServices?: boolean,
) => {
    if (!navigationRef.isReady()) return;

    const root = navigationRef.getRootState();
    const onSlotsScreen = root.routes[root.index]?.name === ROUTES.SLOTS;

    if (onSlotsScreen) {
        navigationRef.dispatch(StackActions.pop());
    }

    navigationRef.dispatch(
        CommonActions.navigate({
            name: NAVIGATORS.DRAWER as keyof CombinedParamList,
            params: {
                screen: NAVIGATORS.SERVICE_STACK,
                params: {
                    screen: ROUTES.SERVICE_DETAILS,
                    params: {
                        id,
                        title,
                        ...(fromMyServices ? { fromMyServices: true } : {}),
                    },
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
