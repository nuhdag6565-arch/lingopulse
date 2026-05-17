import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import type { AppDispatch } from './src/store';
import { loadCurrentUser } from './src/store/authSlice';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppRoot() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, []);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoot />
    </Provider>
  );
}
