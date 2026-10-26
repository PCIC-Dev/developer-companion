import { z } from "zod";

// EXAMPLE ONLY — not a real model. This exists purely to prove that a zod
// schema and its inferred type can be shared between the web app and the API.
// Delete it once the first real schema lands.
export const ExampleSchema = z.object({
  exampleId: z.string(),
  message: z.string(),
});

export type Example = z.infer<typeof ExampleSchema>;
