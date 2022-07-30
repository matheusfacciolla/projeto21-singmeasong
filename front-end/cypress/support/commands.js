const URL = "http://localhost:3000/";

Cypress.Commands.add("resetAll", () => {
  cy.request("POST", "http://localhost:5000/recommendations/reset");
});

Cypress.Commands.add("createRecommendation", (recommendation) => {
  cy.visit(URL);
  cy.get("#inputname").type(recommendation.name);
  cy.get("#inputlink").type(recommendation.youtubeLink);

  cy.intercept("POST", "/recommendations").as("createRecommendation");
  cy.get("#submit").click();
  cy.wait("@createRecommendation");
});