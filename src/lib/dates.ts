const formatters = {
  short: new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  long: new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
};

export type DateFormat = keyof typeof formatters;

export function formatPostDate(date: Date, format: DateFormat = 'long') {
  return formatters[format].format(date);
}
