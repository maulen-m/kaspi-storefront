export const formatKZT = (value: number) => new Intl.NumberFormat("ru-KZ").format(value) + " ₸";
