describe("cart", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Login").click();
    cy.get('input[placeholder="Email address"]').type("customer@test.com");
    cy.get('input[placeholder="Password"]').type("qwerty123");
    cy.get("#login").click();
  });

  it("should add/drop items to/from cart", () => {
    cy.contains("Add to cart").click();
    cy.get(".mantine-Indicator-indicator").contains(1);

    cy.contains("Drop").click();
    cy.get(".mantine-Indicator-indicator").contains(0);
  });

  it("should checkout and place an order", () => {
    cy.contains("Add to cart").click();
    cy.get(".mantine-1kxfbio").click({ force: true });

    cy.get('input[placeholder="Location"]').type("Baku");
    cy.get('textarea[placeholder="Note"]').type("Note");
    cy.get('input[placeholder="Card number"]').type("4242424242424242");
    cy.get('input[placeholder="MM/YY"]').type("04/27");
    cy.get('input[placeholder="CVC"]').type("123");

    cy.get("#checkout").click();

    cy.contains("Your order was successful");
    cy.get(".mantine-Indicator-indicator").contains(0);
  });
});
