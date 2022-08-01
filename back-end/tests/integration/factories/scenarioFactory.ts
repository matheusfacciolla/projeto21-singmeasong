import { prisma } from "../../../src/database.js";
import { faker } from "@faker-js/faker";

import * as recommendationFactory from "./recommendationFactory.js";

export async function scenarioRecommendationWithScoreTwo() {
  const data = await recommendationFactory.createRecommendation();
  const recommendation = await prisma.recommendation.update({
    where: {
      name: data.name,
    },
    data: {
      score: 2,
    },
  });

  return recommendation;
}

export async function scenarioRecommendationWithScoreMinusSix() {
  const data = await recommendationFactory.createRecommendation();
  const recommendation = await prisma.recommendation.update({
    where: {
      name: data.name,
    },
    data: {
      score: -6,
    },
  });

  return recommendation;
}

export async function scenarioWith11Recommendation() {
  const recommendation = [];
  const data = await recommendationFactory.createRecommendationData();

  for (let i = 1; i < 12; i++) {
    const createData = await prisma.recommendation.create({
      data: { name: faker.music.songName(), youtubeLink: data.youtubeLink },
    });
    recommendation.push(createData);
  }

  return recommendation;
}
