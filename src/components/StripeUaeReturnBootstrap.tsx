import { useCallback, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { useSyncUaeOnboardingMutation } from '../redux/Apis/User';
import { navigate } from '../utils/navigation';
import { ROUTES } from '../utils/routes';
import { isStripeUaeReturnUrl } from '../utils/stripe';

/**
 * Handles Stripe Connect return deep links even if AddBeneficiary is not focused.
 */
const StripeUaeReturnBootstrap = () => {
  const [syncOnboarding] = useSyncUaeOnboardingMutation();
  const handling = useRef(false);

  const onReturn = useCallback(
    async (url: string | null) => {
      if (!isStripeUaeReturnUrl(url) || handling.current) return;
      handling.current = true;
      try {
        await syncOnboarding().unwrap();
      } catch {
        // toast via middleware
      } finally {
        navigate(ROUTES.BENEFICIARIES);
        handling.current = false;
      }
    },
    [syncOnboarding],
  );

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      onReturn(url);
    });
    Linking.getInitialURL().then(onReturn).catch(() => {});
    return () => sub.remove();
  }, [onReturn]);

  return null;
};

export default StripeUaeReturnBootstrap;
