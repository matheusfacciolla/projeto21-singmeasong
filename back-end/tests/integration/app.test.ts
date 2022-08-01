import app from "../../src/app.js";
import supertest from "supertest";
import { prisma } from "../../src/database.js";
import * as recommendationFactory from "./factories/recommendationFactory.js";
import * as scenarioFactory from "./factories/scenarioFactory.js";

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
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

  it("given input with name that already exist, fail to create new recommendation", async () => {
    const data = await recommendationFactory.createRecommendation();
    delete data.id;
    delete data.score;

    const response = await supertest(app).post("/recommendations").send(data);
    expect(response.statusCode).toBe(409);
  });
});

describe("upvote recommendations post", () => {
  it("given valid id, add one upvote", async () => {
    const data = await scenarioFactory.scenarioRecommendationWithScoreTwo();

    const response = await supertest(app).post(
      `/recommendations/${data.id}/upvote`
    );
    expect(response.statusCode).toBe(200);

    const dataAfterUpVote = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });
    expect(dataAfterUpVote.score).toEqual(3);
  });

  it("given invalid id, fail to add one upvote", async () => {
    const data = await scenarioFactory.scenarioRecommendationWithScoreTwo();

    const response = await supertest(app).post(`/recommendations/0/upvote`);
    expect(response.statusCode).toBe(404);
  });
});

describe("downvote recommendations post", () => {
  it("given valid id, add one downvote", async () => {
    const data = await scenarioFactory.scenarioRecommendationWithScoreTwo();

    const response = await supertest(app).post(
      `/recommendations/${data.id}/downvote`
    );
    expect(response.statusCode).toBe(200);

    const dataAfterDownVote = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });
    expect(dataAfterDownVote.score).toEqual(1);
  });

  it("given downvote scores get -6, expect to delete recommendation", async () => {
    const data =
      await scenarioFactory.scenarioRecommendationWithScoreMinusSix();
    const response = await supertest(app).post(
      `/recommendations/${data.id}/downvote`
    );
    expect(response.statusCode).toBe(200);

    const dataAfterMinusFive = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });

    expect(dataAfterMinusFive).toBeNull();
  });

  it("given invalid id, fail to add one downvote", async () => {
    const data = await scenarioFactory.scenarioRecommendationWithScoreTwo();

    const response = await supertest(app).post(`/recommendations/0/downvote`);
    expect(response.statusCode).toBe(404);
  });
});

describe("recommendations get tests", () => {
  it("for get recommendations, return status code 200", async () => {
    const data = await scenarioFactory.scenarioWith11Recommendation();
    const response = await supertest(app).get(`/recommendations`);

    expect(response.body.length).toEqual(10);
    expect(data[10]).toEqual(response.body[0]);
    expect(response.statusCode).toBe(200);
  });
});

describe("recommendations get by id tests", () => {
  it("for get recommendations by id, return status code 200", async () => {
    const data = await recommendationFactory.createRecommendation();

    const response = await supertest(app).get(`/recommendations/${data.id}`);
    expect(response.statusCode).toBe(200);
  });

  it("for get recommendations by invalid id, return status code 404", async () => {
    await recommendationFactory.createRecommendation();

    const response = await supertest(app).get(`/recommendations/0`);
    expect(response.statusCode).toBe(404);
  });
});

describe("random recommendations get tests", () => {
  it("for get random recommendations, return status code 200", async () => {
    await scenarioFactory.scenarioWith11Recommendation();

    const response = await supertest(app).get(`/recommendations/random`);
    expect(response.statusCode).toBe(200);
  });

  it("try to get random recommendation without create a recommendation, return status code 404", async () => {
    const response = await supertest(app).get(`/recommendations/random`);
    expect(response.statusCode).toBe(404);
  });
});

describe("top recommendations get by amount score tests", () => {
  it("for get top recommendations by amount score, return status code 200", async () => {
    const data = await scenarioFactory.scenarioRecommendationWithScoreTwo();
    await scenarioFactory.scenarioRecommendationWithScoreMinusSix();
    await scenarioFactory.scenarioWith11Recommendation();

    const response = await supertest(app).get(`/recommendations/top/5`);
    expect(response.body[0]).toEqual(data);
  });

  it("try to get top recommendations by amount score without create a recommendation, return status code 404", async () => {
    const response = await supertest(app).get(`/recommendations/top/5`);
    expect(response.body.length).toEqual(0);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
