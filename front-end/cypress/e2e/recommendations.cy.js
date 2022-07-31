/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000";

beforeEach(() => {
    cy.resetAll();
});

const recommendation = {
    name: faker.music.songName(),
    youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
}

describe("create recommendations", () => {
    it("should create a recommendation successfully", () => {
        cy.createRecommendation(recommendation);
        cy.contains(`${recommendation.name}`).should("exist");
    });

    it("shouldn't create a recommendation successfully", () => {
        cy.createRecommendation(recommendation);
        cy.contains(`${recommendation.name}`).should("not.exist");
    });
});

describe("vote", () => {
    it("should upvote successfully and increase 1", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#upvote').click();

        cy.get('#score').should('contain', '1');
    });

    it("should downvote successfully and decrease 1", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL);
        cy.get('#downvote').click();

        cy.get('#score').should('contain', '1');
    });

    it("should remove recommendation if score below -5", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL);

        cy.get('#downvote').click();
        cy.get('#downvote').click();
        cy.get('#downvote').click();
        cy.get('#downvote').click();
        cy.get('#downvote').click();
        cy.get('#downvote').click();

        cy.contains(`${recommendation.name}`).should("not.exist");
    });
});

describe("get recommendations", () => {
    it("Navigate to home, should get successfully all last 10 recommendations", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#home').click();

        cy.contains(`${recommendation.name}`).should("exist");
        cy.url().should('equal', `${URL}/`);
    });

    it("Navigate to random, should get successfully random recommendations", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#upvote').click();
        cy.get('#random').click();

        cy.contains(`${recommendation.name}`).should("exist");
        cy.url().should('equal', `${URL}/random`);
    });

    it("Navigate to top, should get successfully recommendations order by best score", () => {
        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#upvote').click();
        cy.get('#top').click();

        cy.contains(`${recommendation.name}`).should("exist");
        cy.url().should('equal', `${URL}/top`);
    });
});