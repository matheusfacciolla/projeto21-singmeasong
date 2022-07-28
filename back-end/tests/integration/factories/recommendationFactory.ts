import { faker } from "@faker-js/faker";

import { prisma } from "../../../src/database.js";

export async function createRecommendationData() {
  const data = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
  };

  return data;
}

export async function createRecommendation() {
  const data = await createRecommendationData();
  const recommendation = await prisma.recommendation.create({
    data: data,
  });

  return recommendation;
}
