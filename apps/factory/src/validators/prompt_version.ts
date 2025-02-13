import { z } from "zod";
import {
  InputJsonValue,
  ModelTypeSchema,
} from "~/generated/prisma-client-zod.ts";

const versionNameInput = z.string();

export const llmConfigSchema = z.object({
  temperature: z.number().optional(),
  maxLength: z.number().optional(),
  topP: z.number().optional(),
  freqPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
  logitBias: z.string().optional(),
  stopSequences: z.string().optional(),
  maxTokens: z.number().optional(),
});
export type LlmConfigSchema = z.infer<typeof llmConfigSchema>;

export const getVersionsInput = z
  .object({
    userId: z.string().optional(),
    promptPackageId: z.string(),
    promptTemplateId: z.string(),
  })
  .strict();
export type GetVersionsInput = z.infer<typeof getVersionsInput>;

export const getVersionInput = z
  .object({
    id: z.string(),
  })
  .strict()
  .required();
export type GetVersionInput = z.infer<typeof getVersionInput>;

export const createVersionInput = z
  .object({
    promptPackageId: z.string(),
    promptTemplateId: z.string(),
    version: z.string(),
    forkedFromId: z.null().or(z.string().uuid()),
    moduleType: ModelTypeSchema,
  })
  .strict()
  .required();

export type CreateVersionInput = z.infer<typeof createVersionInput>;

export const updateVersionInput = z
  .object({
    id: z.string(),
    promptPackageId: z.string(),
    promptTemplateId: z.string(),

    // version: z.string(),
    template: z.string(),
    // changelog: z.string().optional(),
    llmProvider: z.string(),
    llmModel: z.string(),
    llmConfig: llmConfigSchema,
  })
  .strict()
  .required();

export type UpdateVersionInput = z.infer<typeof updateVersionInput>;

export const deleteVersionInput = z
  .object({
    id: z.string(),
  })
  .strict();
export type DeleteVersionInput = z.infer<typeof deleteVersionInput>;

const versionSchema = z.object({
  id: z.string(),
  forkedFromId: z.string().nullable(),
  userId: z.string(),
  promptPackageId: z.string(),
  promptTemplateId: z.string(),
  version: z.string(),
  template: z.string(),

  llmProvider: z.string(),
  llmModel: z.string(),
  llmConfig: InputJsonValue.nullable(),

  publishedAt: z.coerce.date().nullable(),
  changelog: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VersionSchema = z.infer<typeof versionSchema>;

export const versionOutput = versionSchema.or(z.null());
export type VersionOutput = z.infer<typeof versionOutput>;

export const versionListOutput = z.array(versionSchema);
export type VersionListOutput = z.infer<typeof versionListOutput>;

// const dd = {
//     "id": "clmq7ranr0001sgpp3l6qou92",
//     "userId": "clmpdlyre0000sgj58t3yilf8",
//     "version": "0.0.1",
//     "template": "\nYou a bot name {#BOT_NAME} trained by {#PROVIDER}\nYou act as {@C_ROLE}, {@C_DESCRIPTION}\n",

//     "inputFields": [],
//     "templateFields": [],
//     "changelog": "TTD",
//     "llmProvider": "openai",
//     "llmModel": "gpt-3.5-turbo",
//     "llmConfig": {},
//     "lang": [],
//     "outAccuracy": null,
//     "outLatency": null,
//     "outCost": null,
//     "promptPackageId":
//     "clmpdm6jm0006sgj59s49k8nv",
//     "promptTemplateId": "clmpzzla20003sg6fku7k5qtv"
// }
