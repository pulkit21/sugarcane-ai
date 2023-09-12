import { z } from "zod";

export const completionInput = z
    .object({
        userId: z.string().optional(),
        promptPackageId: z.string(),
        promptTemplateId: z.string(),
        id: z.string(),

        data: z.record(z.any()),
    })
    .strict()
export type CompletionInput = z.infer<typeof completionInput>;


export const completionOutput = z
    .object({
        completion: z.string(),
        latency: z.number(),
        usage: z.object({
            prompt_tokens: z.number(),
            completion_tokens: z.number(),
            total_tokens: z.number(),
        })
    })
    .strict()
export type CompletionOutput = z.infer<typeof completionOutput>;

