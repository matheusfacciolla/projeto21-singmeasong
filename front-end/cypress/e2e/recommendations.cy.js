/// <reference types="cypress" />

const URL = "http://localhost:3000/";

beforeEach(() => {
    cy.resetAll();
});

describe("create recommendations", () => {
    it("should create a recommendation successfully", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

        cy.createRecommendation(recommendation);

        cy.contains(`${recommendation.name}`).should("exist");
    });

    it("shouldn't create a recommendation successfully", () => {
        const recommendation = {
            name: "WrongName",
            youtubeLink: "WrongLink"
        }

        cy.createRecommendation(recommendation);

        cy.contains(`${recommendation.name}`).should("not.exist");
    });
});

describe("vote", () => {
    it("should upvote successfully and increase 1", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#upvote').click();

        cy.get('#score').should('contain', '1');
    });

    it("should downvote successfully and decrease 1", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

        cy.createRecommendation(recommendation);

        cy.visit(URL);
        cy.get('#downvote').click();

        cy.get('#score').should('contain', '1');
    });

    it("should remove recommendation if score below -5", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

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
    it("should get successfully all last 10 recommendations", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#home').click();

        cy.contains(`${recommendation.name}`).should("exist");
    });

    // it("should get successfully random recommendations", () => {
    //     const recommendation = {
    //         name: "Music",
    //         youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
    //     }

    //     cy.createRecommendation(recommendation);

    //     cy.visit(URL)
    //     cy.get('#upvote').click();
    //     cy.get('#top').click();

    //     cy.contains(`${recommendation.name}`).should("exist");
    // });

    it("should get successfully recommendations order by best score ", () => {
        const recommendation = {
            name: "Music",
            youtubeLink: "https://www.youtube.com/watch?v=awbw9H0Xx20"
        }

        cy.createRecommendation(recommendation);

        cy.visit(URL)
        cy.get('#upvote').click();
        cy.get('#top').click();

        cy.contains(`${recommendation.name}`).should("exist");
    });
});