export const getPaymentLink = (email: string) => {
  return `https://buy.stripe.com/test_8wMg1N95p1OU72E6op?prefilled_email=${encodeURIComponent(email)}`;
};
