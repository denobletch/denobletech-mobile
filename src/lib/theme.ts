export const color = {
  ink: '#202724',
  muted: '#62706A',
  paper: '#F5F3ED',
  white: '#FFFFFF',
  line: '#D9DDD4',
  lime: '#C8EF5A',
  surface: '#EBEEE6',
  danger: '#A42C2C',
};

export function money(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(kobo / 100);
}
