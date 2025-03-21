export const getPaymentLink = (email: string) => {
  return `https://buy.stripe.com/7sI3dl3IGaqW8N2dQQ?prefilled_email=${encodeURIComponent(email)}`;
};
