import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../Store';

type NavigationState = {
  /** Increment to remount ServiceStackNavigator (clears Categories / AddService / stale stack). */
  serviceStackKey: number;
};

const initialState: NavigationState = {
  serviceStackKey: 0,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    bumpServiceStack: state => {
      state.serviceStackKey += 1;
    },
  },
});

export const { bumpServiceStack } = navigationSlice.actions;
export const selectServiceStackKey = (state: RootState) =>
  state.navigation.serviceStackKey;

export default navigationSlice.reducer;
