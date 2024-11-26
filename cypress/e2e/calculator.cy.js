//<reference types="cypress" />

describe('Glassmorphism Calculator', () => {
    // Mapping of operation names to their corresponding data-testid attributes
    const operationTestIds = {
      'plus': 'addition-button',
      'minus': 'subtraction-button',
      'multiply': 'multiplication-button',
      'divide': 'division-button',
      'equals': 'equal-button',
      'clear': 'clear-button',
      'backspace': 'backspace-button',
      'percent': 'percentage-button',
      'decimal': 'floating-point-button',
    };
  
    // Utility function to perform a calculation using data-testid selectors
    const performCalculation = (inputs) => {
      inputs.forEach((input) => {
        switch (input.toLowerCase()) {
          case 'clear':
            cy.get(`[data-testid=${operationTestIds['clear']}]`).click();
            break;
          case 'backspace':
            cy.get(`[data-testid=${operationTestIds['backspace']}]`).click();
            break;
          case 'equals':
            cy.get(`[data-testid=${operationTestIds['equals']}]`).click();
            break;
          case 'percent':
            cy.get(`[data-testid=${operationTestIds['percent']}]`).click();
            break;
          case '.':
          case 'decimal':
            cy.get(`[data-testid=${operationTestIds['decimal']}]`).click();
            break;
          case '+':
          case 'plus':
            cy.get(`[data-testid=${operationTestIds['plus']}]`).click();
            break;
          case '-':
          case 'minus':
            cy.get(`[data-testid=${operationTestIds['minus']}]`).click();
            break;
          case '*':
          case 'multiply':
            cy.get(`[data-testid=${operationTestIds['multiply']}]`).click();
            break;
          case '/':
          case 'divide':
            cy.get(`[data-testid=${operationTestIds['divide']}]`).click();
            break;
          default:
            // Assume the input is a single digit
            if (/^\d$/.test(input)) {
              cy.get(`[data-testid=button-${input}]`).click();
            } else {
              // Handle unexpected inputs gracefully
              throw new Error(`Unrecognized input: ${input}`);
            }
            break;
        }
      });
    };
  
    beforeEach(() => {
      // Visit the calculator app before each test
      cy.visit('http://localhost:9000'); // Ensure this matches the live-server port
  
      // Reset calculator to default state
      cy.get(`[data-testid=${operationTestIds['clear']}]`).click();
    });
  
    context('Theme Toggle', () => {
      it('Should toggle between dark and light themes.', () => {
        // Initially, the calculator should not have the 'dark' class
        cy.get('.calculator').should('not.have.class', 'dark');
  
        // Click the toggle button to switch to dark theme
        cy.get('[data-testid=theme-toggle-button]').click();
  
        // The calculator should now have the 'dark' class
        cy.get('.calculator').should('have.class', 'dark');
  
        // The dark icon should be hidden and light icon should be visible
        cy.get('#dark').should('not.be.visible');
        cy.get('#light').should('be.visible');
  
        // Click the toggle button to switch back to light theme
        cy.get('[data-testid=theme-toggle-button]').click();
  
        // The calculator should not have the 'dark' class
        cy.get('.calculator').should('not.have.class', 'dark');
  
        // The light icon should be hidden and dark icon should be visible
        cy.get('#light').should('not.be.visible');
        cy.get('#dark').should('be.visible');
      });
    });
  
    context('Number Input', () => {
      it('Should input single numbers correctly.', () => {
        const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
  
        numbers.forEach((num) => {
          cy.get(`[data-testid=button-${num}]`).click();
          cy.get('[data-testid=operation-display]').should('contain', num);
          cy.get('[data-testid=result-display]').should('contain', '0'); // Result remains 0 until evaluation
          cy.get(`[data-testid=${operationTestIds['clear']}]`).click(); // Clear after each number
        });
      });
  
      it('Should handle multiple digit inputs correctly.', () => {
        const inputNumbers = ['1', '2', '3', '4', '5'];
  
        performCalculation(inputNumbers);
  
        cy.get('[data-testid=operation-display]').should('contain', '12345');
        cy.get('[data-testid=result-display]').should('contain', '0'); // Result remains 0 until evaluation
      });
  
      it('Should handle leading zeros correctly.', () => {
        performCalculation(['0', '0', '1', '2']);
  
        cy.get('[data-testid=operation-display]').should('contain', '12'); // Leading zeros are ignored
      });
    });
  
    context('Basic Operations', () => {
      it('Should perform addition correctly.', () => {
        performCalculation(['1', 'plus', '2', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '3');
      });
  
      it('Should perform subtraction correctly.', () => {
        performCalculation(['5', 'minus', '3', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '2');
      });
  
      it('Should perform multiplication correctly.', () => {
        performCalculation(['4', 'multiply', '3', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '12');
      });
  
      it('Should perform division correctly.', () => {
        performCalculation(['8', 'divide', '2', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '4');
      });
  
      it('Should respect operator precedence.', () => {
        performCalculation(['2', 'plus', '3', 'multiply', '4', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '14'); // 2 + (3 * 4) = 14
      });
  
      it('Should handle consecutive operations without equals.', () => {
        performCalculation(['2', 'plus', '3', 'multiply', '4']);
        cy.get('[data-testid=operation-display]').should('contain', '2+3*4');
        cy.get('[data-testid=result-display]').should('contain', '0'); // Result remains 0 until evaluation
      });
    });
  
    context('Special Buttons', () => {
      it('Should clear the display when clear button is clicked.', () => {
        performCalculation(['9', 'plus', '1']);
        cy.get('[data-testid=operation-display]').should('contain', '9+1');
        cy.get('[data-testid=result-display]').should('contain', '0');
  
        cy.get(`[data-testid=${operationTestIds['clear']}]`).click();
        cy.get('[data-testid=operation-display]').should('contain', '0');
        cy.get('[data-testid=result-display]').should('contain', '0');
      });
  
      it('Should backspace the last character.', () => {
        performCalculation(['1', '2', '3']);
        cy.get('[data-testid=operation-display]').should('contain', '123');
  
        cy.get(`[data-testid=${operationTestIds['backspace']}]`).click();
        cy.get('[data-testid=operation-display]').should('contain', '12');
  
        cy.get(`[data-testid=${operationTestIds['backspace']}]`).click();
        cy.get('[data-testid=operation-display]').should('contain', '1');
  
        cy.get(`[data-testid=${operationTestIds['backspace']}]`).click();
        cy.get('[data-testid=operation-display]').should('contain', '0');
      });
  
      it('Should handle floating point numbers.', () => {
        performCalculation(['3', '.', '1', '4']);
        cy.get('[data-testid=operation-display]').should('contain', '3.14');
        cy.get('[data-testid=result-display]').should('contain', '0');
      });
  
      it('Should prevent multiple floating points in a number.', () => {
        performCalculation(['2', '.', '.', '5']);
        cy.get('[data-testid=operation-display]').should('contain', '2.5'); // Only one decimal point is allowed
      });
  
      it('Should handle percentage calculations.', () => {
        // Enter "5" then "0" to make "50"
        performCalculation(['5', '0', 'percent']);
        cy.get('[data-testid=operation-display]').should('contain', '50%');
  
        performCalculation(['plus']);
  
        // Enter "2" then "5" to make "25"
        performCalculation(['2', '5', 'percent']);
        cy.get('[data-testid=operation-display]').should('contain', '50%+25%');
  
        performCalculation(['equals']);
        cy.get('[data-testid=result-display]').should('contain', '0.75'); // 50% + 25% = 0.75
      });
    });
  
    context('Error Handling', () => {
      it('Should display error for invalid operations.', () => {
        performCalculation(['divide', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', 'Error');
      });
  
      it('Should handle division by zero.', () => {
        performCalculation(['5', 'divide', '0', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', 'Error');
      });
  
      it('Should display error for incomplete expressions.', () => {
        performCalculation(['9', 'plus', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', 'Error');
      });
    });
  
    context('Sequential Operations', () => {
      it('Should handle multiple operations in sequence.', () => {
        performCalculation(['2', 'plus', '3', 'multiply', '4', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '14'); // 2 + (3 * 4) = 14
      });
  
      it('Should continue calculations after equals.', () => {
        performCalculation(['6', 'divide', '2', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '3');
  
        // Continue with another operation
        performCalculation(['plus', '4', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '7'); // 3 + 4 = 7
      });
    });
  
    context('Display Updates', () => {
      it('Should reset display after evaluation when a new number is entered.', () => {
        performCalculation(['7', 'plus', '3', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '10');
  
        // Enter a new number after evaluation
        performCalculation(['5']);
        cy.get('[data-testid=operation-display]').should('contain', '5');
        cy.get('[data-testid=result-display]').should('contain', '10');
      });
  
      it('Should retain operation history correctly.', () => {
        performCalculation(['1', 'plus', '2', 'equals']);
        cy.get('[data-testid=operation-display]').should('contain', '1+2');
  
        performCalculation(['multiply', '4', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '12'); // 3 * 4 = 12
      });
    });
  
    context('Keyboard Support', () => {
      it('Should allow input via keyboard.', () => {
        // Type '7 + 8 =' using keyboard
        cy.get('body').type('7');
        cy.get('body').type('+');
        cy.get('body').type('8');
        cy.get('body').type('{enter}'); // Assuming Enter key acts as equals
  
        cy.get('[data-testid=result-display]').should('contain', '15');
      });
  
      it('Should handle keyboard backspace.', () => {
        cy.get('body').type('123');
        cy.get('[data-testid=operation-display]').should('contain', '123');
  
        cy.get('body').type('{backspace}');
        cy.get('[data-testid=operation-display]').should('contain', '12');
  
        cy.get('body').type('{backspace}');
        cy.get('[data-testid=operation-display]').should('contain', '1');
  
        cy.get('body').type('{backspace}');
        cy.get('[data-testid=operation-display]').should('contain', '0');
      });
    });
  
    context('Edge Cases', () => {
      it('Should handle very large numbers.', () => {
        const largeNumber = '9999999999';
        const inputs = largeNumber.split('');
        performCalculation(inputs);
        cy.get('[data-testid=operation-display]').should('contain', largeNumber);
  
        performCalculation(['plus', '1', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '10000000000');
      });
  
      it('Should handle switching operators mid-operation.', () => {
        performCalculation(['5', 'plus', 'minus', '3', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '2'); // 5 - 3 = 2
      });
  
      it('Should handle multiple percentage operations.', () => {
        // Since the calculator prevents multiple '%', expect only one '%'
        performCalculation(['1', '0', '0', 'percent', 'percent']);
        cy.get('[data-testid=operation-display]').should('contain', '100%'); // Only one '%' should be present
  
        performCalculation(['equals']);
        cy.get('[data-testid=result-display]').should('contain', '1'); // 100% = 1
      });
  
      it('Should handle negative results.', () => {
        performCalculation(['3', 'minus', '5', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '-2');
      });
  
      it('Should handle chaining of multiple operations.', () => {
        performCalculation(['1', 'plus', '2', 'multiply', '3', 'minus', '4', 'divide', '2', 'equals']);
        cy.get('[data-testid=result-display]').should('contain', '5'); // 1 + (2 * 3) - (4 / 2) = 5
      });
    });
  });
  