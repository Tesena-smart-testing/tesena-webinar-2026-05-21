export const ENVIRONMENTS = ["INT", "INT2", "ACC", "ACC2"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

/**
 * Načtení a validace testovacího prostředí ze systemové proměnné
 */
const rawEnv = process.env.ENVIRONMENT ?? "ACC";
export const env: Environment = (() => {
  // Ověření hodnoty rawEnv
  if (!ENVIRONMENTS.includes(rawEnv as Environment)) {
    throw new Error(`Invalid environment: [${rawEnv}]`);
  }
  return rawEnv as Environment;
})();
