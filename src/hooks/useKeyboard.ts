import { Keyboard, KeyboardEvent, LayoutAnimation } from 'react-native';
import { useEffect, useState } from 'react';

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    // Try to get initial keyboard state, but handle gracefully if it fails
    try {
      const metrics = Keyboard.metrics();
      if (metrics && typeof metrics.height === 'number' && metrics.height > 0) {
        setKeyboardHeight(metrics.height);
      }
    } catch (error) {
      console.log('Keyboard.metrics() not available:', error);
      // Fallback to event listener only
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboard;
