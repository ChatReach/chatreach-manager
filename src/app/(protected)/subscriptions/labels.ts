const LABEL_OVERRIDES: Record<string, string> = {
  workflows: 'Active workflows/automations',
  flows: 'Flows/Forms',
  broadcasts: 'Campaign Broadcasts',
};

export const humanize = (value: string): string =>
  LABEL_OVERRIDES[value] ??
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
