describe("login", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Login").click();
  });

  it("should login given valid credentials", () => {
    cy.get('input[placeholder="Email address"]').type("customer@test.com");
    cy.get('input[placeholder="Password"]').type("qwerty123");
    cy.get("#login").click();

    cy.contains("Emin Aliyev");
  });

  it("should throw an error given invalid credentials", () => {
    cy.get('input[placeholder="Email address"]').type("customero@test.com");
    cy.get('input[placeholder="Password"]').type("qwerty123");
    cy.get("#login").click();

    cy.contains("Invalid username or password");
  });
});
