/** Custom URL scheme for Stripe Connect return into the doctor/trainer app. */
export const STRIPE_UAE_URL_SCHEME = 'yallagaindoctor';
export const STRIPE_UAE_RETURN_HOST = 'stripe-uae';
export const STRIPE_UAE_RETURN_URL = `${STRIPE_UAE_URL_SCHEME}://${STRIPE_UAE_RETURN_HOST}`;

export const isStripeUaeReturnUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return (
    url.startsWith(`${STRIPE_UAE_RETURN_URL}`) ||
    url.startsWith(`${STRIPE_UAE_URL_SCHEME}://${STRIPE_UAE_RETURN_HOST}`)
  );
};
