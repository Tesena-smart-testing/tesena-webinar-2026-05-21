export const ENVIRONMENTS = ['INT', 'INT2', 'ACC', 'ACC2'] as const;
export type Environment = typeof ENVIRONMENTS[number]