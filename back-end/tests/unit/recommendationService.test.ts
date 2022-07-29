import { jest } from "@jest/globals";

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";

import { CreateRecommendationData } from "../../src/services/recommendationsService.js";
import { Recommendation } from "@prisma/client";

import { notFoundError } from "../../src/utils/errorUtils.js";

jest.mock("../../src/repositories/recommendationRepository.js");

describe("insert recommendation test suite", () => {
  it("should create a recommendation", async () => {
    const recommendation: CreateRecommendationData = {
      name: "Fulano",
      youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
    };

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});

    await recommendationService.insert(recommendation);
    expect(recommendationRepository.create).toBeCalled();
  });

  it("should not create duplicated recommendations", async () => {
    const recommendation: CreateRecommendationData = {
      name: "Fulano",
      youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
    };

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return {
          name: recommendation.name,
          youtubeLink: recommendation.youtubeLink,
        };
      });

    const promise = recommendationService.insert(recommendation);
    expect(promise).rejects.toEqual({
      message: "Recommendations names must be unique",
      type: "conflict",
    });
  });
});

describe("upvote test suite", () => {
  it("should upvote recommendation", async () => {
    const recommendation: Recommendation = {
      id: 1,
      name: "Fulano",
      youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
      score: 3,
    };

    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return { ...recommendation, score: 4 };
      });

    await recommendationService.upvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("should fail upvote recommendation if id doesn't exist", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return null;
      });

    expect(recommendationService.upvote(0)).rejects.toEqual(notFoundError());
  });
});

describe("downvote test suite", () => {
  it("should downvote recommendation and delete recommendation if score is less than -5", async () => {
    const recommendation: Recommendation = {
      id: 1,
      name: "Fulano",
      youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
      score: -5,
    };

    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return recommendation;
      });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {
        return { ...recommendation, score: -6 };
      });

    jest
      .spyOn(recommendationRepository, "remove")
      .mockImplementationOnce((): any => {});

    await recommendationService.downvote(recommendation.id);
    expect(recommendationRepository.remove).toBeCalled();
  });

  it("should fail downvote recommendation if id doesn't exist", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockImplementationOnce((): any => {
        return null;
      });

    expect(recommendationService.upvote(100)).rejects.toEqual(notFoundError());
  });
});

describe("get recommendations test suite", () => {
  it("should get all ten last recommendations", async () => {
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockImplementationOnce((): any => {});

    await recommendationService.get();
    expect(recommendationRepository.findAll).toBeCalled();
  });

  it("should get recommendation by id", async () => {
    const recommendations = [
      {
        id: 1,
        name: "Fulano",
        youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
        score: 20,
      },
      {
        id: 2,
        name: "Ciclano",
        youtubeLink: "https://www.youtube.com/watch?v=JVSJ_mGWIDc",
        score: 10,
      },
    ];

    jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockImplementationOnce((): any => {
        return { ...recommendations };
      });

    await recommendationService.getTop(2);
    expect(recommendationRepository.getAmountByScore).toBeCalled();
  });
});
