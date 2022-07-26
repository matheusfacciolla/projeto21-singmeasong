import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";
import * as recommendationFactory from "./factories/recommendationFactory.js"

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("post new recommendation tests", () => {
  it("given valid input, create new recommendation", async () => {
    const data = await recommendationFactory.createRecommendationData();

    const response = await supertest(app).post("/recommendations").send(data);
    expect(response.statusCode).toBe(201);
  });

  it("given invalid input, fail to create new recommendation", async () => {
    const data = await recommendationFactory.createRecommendationData();
    delete data.youtubeLink;

    const response = await supertest(app).post("/recommendations").send(data);
    expect(response.statusCode).toBe(422);
  });
});

describe("upvote recommendations post", () => {
  it("given valid id, add one upvote", async () => {
    const data = await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(`/recommendations/${data.id}/upvote`);
    expect(response.statusCode).toBe(200);
  });

  it("given invalid id, fail to add one upvote", async () => {
    await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(`/recommendations/0/upvote`);
    expect(response.statusCode).toBe(404);
  });
});

describe("downvote recommendations post", () => {
  it("given valid id, add one downvote", async () => {
    const data = await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(`/recommendations/${data.id}/downvote`);
    expect(response.statusCode).toBe(200);
  });

  it("given invalid id, fail to add one downvote", async () => {
    await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(`/recommendations/0/downvote`);
    expect(response.statusCode).toBe(404);
  });
});

describe("recommendations get tests", () => {
  it("for get recommendations, return status code 200", async () => {
    await recommendationFactory.createRecommendation();

    const response = await supertest(app).get(`/recommendations`);
    expect(response.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});