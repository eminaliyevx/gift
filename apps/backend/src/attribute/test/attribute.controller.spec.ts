import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { AttributeController } from "../attribute.controller";
import { AttributeService } from "../attribute.service";

describe("AttributeController", () => {
  let attributeController: AttributeController;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AttributeController],
      providers: [AttributeService, PrismaService, ConfigService],
    }).compile();

    attributeController =
      moduleRef.get<AttributeController>(AttributeController);
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    await prismaService.category.createMany({
      data: [
        { id: "cata1", name: "Category 1" },
        { id: "cata2", name: "Category 2" },
      ],
    });

    await prismaService.attribute.create({
      data: {
        id: "att1",
        name: "attributish 1",
        categories: { connect: [{ id: "cata1" }, { id: "cata2" }] },
      },
    });
  });

  describe("create", () => {
    it("should create attribute with categories", async () => {
      const createAttributeDto = {
        name: "testAtt",
        categories: ["cata1", "cata2"],
      };

      const result = await attributeController.create(createAttributeDto);

      expect(result.name).toBe(createAttributeDto.name);
      expect(result.categories.map(({ id }) => id)).toEqual(
        createAttributeDto.categories,
      );
    });
  });

  describe("find", () => {
    it("should find many attributes", async () => {
      const result = await attributeController.findMany();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should find unique attribute", async () => {
      const result = await attributeController.findUnique("att1");

      expect(result.name).toEqual("attributish 1");
    });
  });

  describe("update", () => {
    it("should update attribute", async () => {
      const updateAttributeDto = {
        name: "attributish 1 updated",
        categories: ["cata1"],
      };

      const result = await attributeController.update(
        "att1",
        updateAttributeDto,
      );

      expect(result.name).toBe(updateAttributeDto.name);
      expect(result.categories.map(({ id }) => id)).toEqual(
        updateAttributeDto.categories,
      );
    });
  });

  describe("delete", () => {
    it("should delete attribute", async () => {
      const result = await attributeController.delete("att1");

      expect(result.id).toBe("att1");
    });
  });
});
