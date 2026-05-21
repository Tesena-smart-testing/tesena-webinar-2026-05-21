export const ENVIRONMENTS = ["TEST"] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

const rawEnv = process.env.ENVIRONMENT ?? "TEST";
export const env: Environment = (() => {
  if (!ENVIRONMENTS.includes(rawEnv as Environment)) {
    throw new Error(`Invalid environment: [${rawEnv}]`);
  }
  return rawEnv as Environment;
})();
