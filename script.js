// Theme Toggle Functionality
const toggler = document.getElementById('toggler');
const calculator = document.querySelector('.calculator');

const updateThemeIcons = () => {
  if (calculator.classList.contains('dark')) {
    toggler.querySelector('#light').style.display = 'block';
    toggler.querySelector('#dark').style.display = 'none';
  } else {
    toggler.querySelector('#light').style.display = 'none';
    toggler.querySelector('#dark').style.display = 'block';
  }
};

updateThemeIcons();

toggler.addEventListener('click', () => {
  calculator.classList.toggle('dark');
  updateThemeIcons();
});

// Calculator Logic
const operationDisplay = document.querySelector('.calculator-operation');
const resultDisplay = document.querySelector('.calculator-operation-result');
let currentOperation = '0';
let shouldResetDisplay = false;
let lastResult = null;

// Initialize Display
operationDisplay.textContent = '0';
resultDisplay.textContent = '0';

// Clear Button
document.querySelector('.clear-button').addEventListener('click', () => {
  currentOperation = '0';
  operationDisplay.textContent = '0';
  resultDisplay.textContent = '0';
  shouldResetDisplay = false;
  lastResult = null;
  console.log("Clear button clicked: operation cleared");
});

// Backspace Button
document.querySelector('.backspace-button').addEventListener('click', () => {
  if (!shouldResetDisplay && currentOperation.length > 1) {
    currentOperation = currentOperation.slice(0, -1);
  } else {
    currentOperation = '0';
  }
  operationDisplay.textContent = currentOperation;
  console.log("Backspace button clicked: currentOperation = " + currentOperation);
});

// Equal Button
document.querySelector('.equal-button').addEventListener('click', () => {
  try {
    if (currentOperation.trim() === '' || /[+\-*/.]$/.test(currentOperation)) {
      throw new Error('Invalid Operation');
    }

    // Preprocess the expression to handle percentages
    const sanitizedOperation = preprocessPercentages(currentOperation);
    console.log("Sanitized Operation: " + sanitizedOperation);

    const evaluatedResult = eval(sanitizedOperation);
    if (evaluatedResult === Infinity || evaluatedResult === -Infinity || isNaN(evaluatedResult)) {
      throw new Error('Math Error');
    }
    resultDisplay.textContent = evaluatedResult;
    // Retain the original operation for display
    // Do not modify currentOperation
    shouldResetDisplay = true;
    lastResult = evaluatedResult;
    console.log("Equal button clicked: evaluatedResult = " + evaluatedResult);
  } catch (error) {
    resultDisplay.textContent = 'Error';
    shouldResetDisplay = true;
    console.log("Equal button clicked: Error in evaluation - " + error.message);
  }
});

// Floating Point Button
document.querySelector('.floating-point-button').addEventListener('click', () => {
  if (shouldResetDisplay) {
    currentOperation = '0';
    shouldResetDisplay = false;
  }
  const lastNumberSegment = currentOperation.split(/[\+\-\*\/]/).pop();
  if (!lastNumberSegment.includes('.')) {
    if (currentOperation === '' || currentOperation === '0') {
      currentOperation = '0.';
    } else {
      currentOperation += '.';
    }
    operationDisplay.textContent = currentOperation;
    console.log("Floating point button clicked: .");
  } else {
    console.log("Floating point button clicked but ignored due to invalid state");
  }
});

// Percentage Button
document.querySelector('.percentage-button').addEventListener('click', () => {
  if (!/[+\-*/.]$/.test(currentOperation) && currentOperation !== '') {
    // Replace the last number with its percentage value
    currentOperation = replaceLastNumberWithPercentage(currentOperation);
    operationDisplay.textContent = currentOperation;
    console.log("Percentage button clicked: %");
  } else {
    console.log("Percentage button clicked but ignored due to invalid state");
  }
});

// Number and Operator Buttons
document.querySelectorAll('.calculator-button:not(.floating-point-button):not(.percentage-button)').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent.trim();

    if (button.classList.contains('highlight')) {
      // Handle numbers
      if (shouldResetDisplay) {
        currentOperation = '';
        shouldResetDisplay = false;
      }
      if (currentOperation === '0') {
        currentOperation = value;
      } else {
        currentOperation += value;
      }
      console.log("Number button clicked: " + value);
    } else if (button.classList.contains('addition-button')) {
      addOperator('+');
      console.log("Addition button clicked: +");
    } else if (button.classList.contains('subtraction-button')) {
      addOperator('-');
      console.log("Subtraction button clicked: -");
    } else if (button.classList.contains('multiplication-button')) {
      addOperator('*');
      console.log("Multiplication button clicked: *");
    } else if (button.classList.contains('division-button')) {
      addOperator('/');
      console.log("Division button clicked: /");
    }

    operationDisplay.textContent = currentOperation;
    console.log("Current operation: " + currentOperation);
  });
});

// Function to add operator ensuring no consecutive operators
function addOperator(operator) {
  if (shouldResetDisplay && lastResult !== null) {
    currentOperation = lastResult.toString();
    shouldResetDisplay = false;
  }
  if (currentOperation === '0') {
    currentOperation = '0';
  }
  if (/[+\-*/]$/.test(currentOperation)) {
    currentOperation = currentOperation.slice(0, -1);
  }
  currentOperation += operator;
}

// Function to preprocess the expression to handle percentages
function preprocessPercentages(operation) {
  // Replace 'number operator number%' based on operator
  operation = operation.replace(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)%/g, function(match, p1, p2, operator, p4) {
    const lastNumber = parseFloat(p1);
    const percentage = parseFloat(p4);
    if (operator === '+' || operator === '-') {
      return `${operator} (${lastNumber} * ${percentage} / 100)`;
    } else if (operator === '*' || operator === '/') {
      return `${operator} (${percentage} / 100)`;
    }
  });

  // Replace standalone 'number%' with '(number / 100)'
  operation = operation.replace(/(\d+(\.\d+)?)%/g, '($1 / 100)');

  return operation;
}

// Function to handle percentage replacement in display
function replaceLastNumberWithPercentage(operation) {
  const regex = /(\d+(\.\d+)?)$/;
  const match = operation.match(regex);
  if (match) {
    const number = match[1];
    // Prevent multiple '%' signs
    if (number.endsWith('%')) {
      return operation; // Already has a percentage
    }
    return operation.replace(regex, `${number}%`);
  }
  return operation;
}

// Keyboard Support
document.addEventListener('keydown', (event) => {
  const key = event.key;
  if (/\d/.test(key)) { // If key is a digit
    event.preventDefault();
    handleNumberInput(key);
  } else if (key === '+') {
    event.preventDefault();
    addOperator('+');
  } else if (key === '-') {
    event.preventDefault();
    addOperator('-');
  } else if (key === '*' || key === 'x' || key === 'X') {
    event.preventDefault();
    addOperator('*');
  } else if (key === '/') {
    event.preventDefault();
    addOperator('/');
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    document.querySelector('.equal-button').click();
  } else if (key === 'Backspace') {
    event.preventDefault();
    document.querySelector('.backspace-button').click();
  } else if (key === '.') {
    event.preventDefault();
    document.querySelector('.floating-point-button').click();
  } else if (key === '%') {
    event.preventDefault();
    document.querySelector('.percentage-button').click();
  }
});

function handleNumberInput(number) {
  if (shouldResetDisplay) {
    currentOperation = '';
    shouldResetDisplay = false;
  }
  if (currentOperation === '0') {
    currentOperation = number;
  } else {
    currentOperation += number;
  }
  operationDisplay.textContent = currentOperation;
  console.log("Keyboard number input: " + number);
}