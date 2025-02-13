import { ppid } from "process";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getPackagesInput,
  getPackageInput,
  createPackageInput,
  deletePackageInput,
  packageOutput,
  packageListOutput,
} from "~/validators/prompt_package";
import {
  getTemplatesInput,
  getTemplateInput,
  createTemplateInput,
  updateTemplateInput,
  deleteTemplateInput,
  templateOutput,
  templateListOutput,
  deployTemplateInput,
} from "~/validators/prompt_template";
import {
  getVersionsInput,
  getVersionInput,
  createVersionInput,
  updateVersionInput,
  deleteVersionInput,
  versionOutput,
  versionListOutput,
} from "~/validators/prompt_version";
import { JsonObject } from "@prisma/client/runtime/library";
import { ModelTypeSchema } from "~/generated/prisma-client-zod.ts";
import { Visibility } from "@mui/icons-material";

export const promptRouter = createTRPCRouter({
  getPackages: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/packages",
        tags: ["packages"],
        summary: "Read all packages",
      },
    })
    .input(getPackagesInput)
    .output(packageListOutput)
    .query(async ({ ctx, input }) => {
      let query = {
        userId: ctx.jwt?.id as string,
      };
      console.log(`packages input -------------- ${JSON.stringify(query)}`);

      const packages = await ctx.prisma.promptPackage.findMany({
        where: query,
      });
      console.log(`packages out -------------- ${JSON.stringify(packages)}`);
      return packages;
    }),

  getPackage: protectedProcedure
    .input(getPackageInput)
    .output(packageOutput)
    .query(async ({ ctx, input }) => {
      let query = {
        userId: ctx.jwt?.id as string,
        id: input.id,
      };

      const pkg = await ctx.prisma.promptPackage.findFirst({
        where: query,
      });
      // console.log(`package -------------- ${JSON.stringify(pkg)}`);
      return pkg;
    }),

  createPackage: protectedProcedure
    .input(createPackageInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.jwt?.id as string;
      let promptPackage = null;

      if (userId) {
        promptPackage = await ctx.prisma.promptPackage.create({
          data: {
            name: input.name,
            description: input.description,

            userId: userId,
          },
        });
      }
      return promptPackage;
    }),

  createTemplate: protectedProcedure
    .input(createTemplateInput)
    .output(templateOutput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.jwt?.id as string;
      let pt = null;

      console.log(`template input -------------- ${JSON.stringify(input)}`);

      if (userId) {
        pt = await ctx.prisma.promptTemplate.create({
          data: {
            userId: userId,
            promptPackageId: input.promptPackageId,
            name: input.name,
            description: input.description,
            modelType: input.modelType,
          },
          include: {
            previewVersion: true,
            releaseVersion: true,
          },
        });
      }

      console.log(`template output -------------- ${JSON.stringify(pt)}`);

      return pt;
    }),

  // updateTemplate: protectedProcedure
  // .input(updateTemplateInput)
  // .output(TemplateOutput)
  // .mutation(async ({ ctx, input }) => {

  //   const userId = ctx.session?.user.id
  //   console.log(`update template -------------- ${JSON.stringify(input)}`);

  //   if (userId) {
  //     pt = await ctx.prisma.promptPackage.update({
  //       data: {
  //         promptPackageId: input.promptPackageId,
  //         name: input.name,
  //         description: input.description,
  //       }});
  //   }

  //     return pt;
  // }),

  getTemplates: protectedProcedure
    .input(getTemplatesInput)
    .output(templateListOutput)
    .query(async ({ ctx, input }) => {
      // console.log(`templates -------------- ${JSON.stringify(input)}`);
      const templates = await ctx.prisma.promptTemplate.findMany({
        where: {
          userId: ctx.jwt?.id as string,
          promptPackageId: input.promptPackageId,
        },
        include: {
          previewVersion: true,
          releaseVersion: true,
        },
      });
      // console.log(`templates -------------- ${JSON.stringify(templates)}`);
      return templates;
    }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),

  createVersion: protectedProcedure
    .input(createVersionInput)
    .output(versionOutput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.jwt?.id as string;
      // let pv = null;

      console.log(`create version -------------- ${JSON.stringify(input)}`);

      let modelType = input.moduleType === ModelTypeSchema.Enum.TEXT2TEXT;

      let template = modelType
        ? `I am looking at the {@OBJECT}`
        : `A photo of an astronaut riding a horse on {@OBJECT}`;

      let defaultTemplate = {
        template: template,
        llmModelType: input.moduleType,
        llmProvider: modelType ? "llama2" : "runwayml",
        llmModel: modelType ? "7b" : "stable-diffusion-v1-5",
        llmConfig: {},
        // forkedFromId: null
      };

      if (input.forkedFromId) {
        const forkedFrom = await ctx.prisma.promptVersion.findUnique({
          where: {
            id: input.forkedFromId,
          },
        });
        if (forkedFrom) {
          defaultTemplate.template = forkedFrom.template;
          defaultTemplate.llmProvider = forkedFrom.llmProvider;
          defaultTemplate.llmModel = forkedFrom.llmModel;
          defaultTemplate.llmConfig = forkedFrom.llmConfig as JsonObject;
        }

        // defaultTemplate.forkedFromId = input.forkedFromId
      }

      if (!userId) {
        return null;
      }

      const pv = await ctx.prisma.promptVersion.create({
        data: {
          userId: userId,
          forkedFromId: input.forkedFromId,

          promptPackageId: input.promptPackageId,
          promptTemplateId: input.promptTemplateId,
          version: input.version,

          ...defaultTemplate,

          changelog: "",
        },
      });

      return pv;
    }),

  updateVersion: protectedProcedure
    .input(updateVersionInput)
    .output(versionOutput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.jwt?.id as string;
      let pv = null;
      console.log(`update version -------------- ${JSON.stringify(input)}`);

      if (userId) {
        pv = await ctx.prisma.promptVersion.update({
          where: {
            id: input.id,
            userId: userId,
            promptPackageId: input.promptPackageId,
            promptTemplateId: input.promptTemplateId,
          },
          data: {
            // version: input.version,
            template: input.template,
            // changelog: input.changelog,
            llmProvider: input.llmProvider,
            llmModel: input.llmModel,
            llmConfig: input.llmConfig,
          },
        });
      }
      console.log(`updated version -------------- ${JSON.stringify(pv)}`);

      return pv;
    }),

  deployTemplate: protectedProcedure
    .input(deployTemplateInput)
    // .output(versionOutput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.jwt?.id as string;
      let pv = null;
      let pt = null;
      console.log(`deploy template -------------- ${JSON.stringify(input)}`);

      let data = {
        changelog: input.changelog,
        publishedAt: new Date(),
      };

      let templateData: { [key: string]: any } = {};
      templateData[`${input.environment}VersionId`] = input.promptVersionId;

      // data[`${input.environment}Version`] = {
      //   connect: {
      //     id: input.promptVersionId
      //   }
      // }

      if (userId) {
        const transaction = await ctx.prisma.$transaction(async (prisma) => {
          pv = await prisma.promptVersion.update({
            where: {
              id: input.promptVersionId,
              // promptTemplateId: input.promptTemplateId,
              // userId: userId,
              // promptPackageId: input.promptPackageId,
            },
            data: data,
          });

          pt = await prisma.promptTemplate.update({
            where: {
              id: input.promptTemplateId,
              promptPackageId: input.promptPackageId,
              userId: userId,
            },
            data: templateData,
          });

          return { pv, pt };
        });
      }
      console.log(
        `deployed version -------------- ${JSON.stringify(pv)} ${JSON.stringify(
          pt,
        )}`,
      );
      return { pv, pt };
    }),

  getVersions: protectedProcedure
    .input(getVersionsInput)
    .output(versionListOutput)
    .query(async ({ ctx, input }) => {
      console.log(`versions input -------------- ${JSON.stringify(input)}`);
      const versions = await ctx.prisma.promptVersion.findMany({
        where: {
          userId: ctx.jwt?.id as string,
          promptPackageId: input.promptPackageId,
          promptTemplateId: input.promptTemplateId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      // console.log(`versions output -------------- ${JSON.stringify(versions)}`);
      return versions;
    }),
});
