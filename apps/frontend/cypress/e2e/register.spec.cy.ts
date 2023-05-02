describe("register", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Login").click();
  });

  it("should register a business", () => {
    cy.contains("Register").click();

    cy.get('input[placeholder="Email address"]').type("busi@test.com");
    cy.get('input[placeholder="Password"]').type("qwerty123");
    cy.get('input[placeholder="Phone"]').type("778681212");
    cy.get('input[placeholder="Who are you?"]').click();
    cy.contains("Business").click();
    cy.get('input[placeholder="Name"]').type("Namely");
    cy.get("#register").click();

    cy.contains("Success");
  });
});
