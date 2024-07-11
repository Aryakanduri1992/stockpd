"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var chartInstance = null; // Global variable to keep track of the Chart.js instance
// Fetch historical stock data from Alpha Vantage API with rate limit handling

function fetchStockData(symbol) {
  var apiKey, url, response, data;
  return regeneratorRuntime.async(function fetchStockData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          apiKey = 'W69SKYDC7J7YHF46'; // Replace with your Alpha Vantage API key

          url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=".concat(symbol, "&apikey=").concat(apiKey);
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(fetch(url));

        case 5:
          response = _context.sent;

          if (!(response.status === 429)) {
            _context.next = 8;
            break;
          }

          throw new Error('Rate limit exceeded. Please wait and try again.');

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(response.json());

        case 10:
          data = _context.sent;
          console.log("Fetched stock data:", data); // Debugging output

          if (!data['Time Series (Daily)']) {
            _context.next = 16;
            break;
          }

          return _context.abrupt("return", data['Time Series (Daily)']);

        case 16:
          throw new Error(data['Note'] || 'Failed to retrieve data');

        case 17:
          _context.next = 23;
          break;

        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](2);
          console.error('Error fetching stock data:', _context.t0);
          throw _context.t0;

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 19]]);
} // Use ChatGPT to predict future stock prices


function predictStockPricesWithChatGPT(symbol, historicalData) {
  var apiKey, apiUrl, closingPrices, prompt, response, data, predictionText, predictions;
  return regeneratorRuntime.async(function predictStockPricesWithChatGPT$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          apiKey = 'sk-proj-5juprBo9dw9wdpOq5opJT3BlbkFJA2aOYGK54Ia0Udb3rSXM'; // Replace with your OpenAI API key

          apiUrl = 'https://api.openai.com/v1/chat/completions'; // OpenAI Chat API URL
          // Format the historical data as input for ChatGPT

          closingPrices = Object.values(historicalData).map(function (day) {
            return parseFloat(day['4. close']);
          }).reverse();
          prompt = "Given the following closing prices for stock ".concat(symbol, ": ").concat(closingPrices.join(', '), ", predict the next 7 days of closing prices. Please provide the prices as a comma-separated list.");
          console.log("Prompt for GPT-3:", prompt);
          _context2.prev = 5;
          _context2.next = 8;
          return regeneratorRuntime.awrap(fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': "Bearer ".concat(apiKey)
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{
                role: "user",
                content: prompt
              }],
              max_tokens: 100,
              // Adjust as needed
              temperature: 0.5
            })
          }));

        case 8:
          response = _context2.sent;
          _context2.next = 11;
          return regeneratorRuntime.awrap(response.json());

        case 11:
          data = _context2.sent;
          console.log("GPT-3 response:", data); // Debugging output

          if (!(data.choices && data.choices.length > 0)) {
            _context2.next = 20;
            break;
          }

          predictionText = data.choices[0].message.content.trim();
          predictions = predictionText.split(',').map(function (price) {
            return parseFloat(price.trim());
          });
          console.log("Predictions:", predictions);
          return _context2.abrupt("return", predictions);

        case 20:
          throw new Error("Invalid GPT-3 response");

        case 21:
          _context2.next = 27;
          break;

        case 23:
          _context2.prev = 23;
          _context2.t0 = _context2["catch"](5);
          console.error('Error predicting stock prices with ChatGPT:', _context2.t0);
          throw _context2.t0;

        case 27:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[5, 23]]);
} // Main function to handle the prediction


function predictStockPrices(symbol) {
  var loadingElement, errorElement, resultElement, tableBody, viewToggleElement, chartViewElement, tableViewElement, backButtonContainer, stockData, predictions;
  return regeneratorRuntime.async(function predictStockPrices$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          loadingElement = document.getElementById('loading');
          errorElement = document.getElementById('error');
          resultElement = document.getElementById('result');
          tableBody = document.querySelector('#priceTable tbody');
          viewToggleElement = document.getElementById('viewToggle');
          chartViewElement = document.getElementById('chartView');
          tableViewElement = document.getElementById('tableView');
          backButtonContainer = document.getElementById('backButtonContainer');
          loadingElement.style.display = 'block';
          errorElement.style.display = 'none';
          tableBody.innerHTML = '';
          chartViewElement.style.display = 'none';
          tableViewElement.style.display = 'none';
          viewToggleElement.style.display = 'none';
          backButtonContainer.style.display = 'none';
          _context3.prev = 15;
          _context3.next = 18;
          return regeneratorRuntime.awrap(fetchStockData(symbol));

        case 18:
          stockData = _context3.sent;

          if (!stockData) {
            _context3.next = 26;
            break;
          }

          _context3.next = 22;
          return regeneratorRuntime.awrap(predictStockPricesWithChatGPT(symbol, stockData));

        case 22:
          predictions = _context3.sent;

          if (predictions) {
            displayChart(stockData, predictions);
            displayTable(stockData, predictions);
            chartViewElement.style.display = 'block';
            viewToggleElement.style.display = 'block';
            backButtonContainer.style.display = 'block';
          } else {
            errorElement.textContent = 'Failed to get predictions';
            errorElement.style.display = 'block';
          }

          _context3.next = 28;
          break;

        case 26:
          errorElement.textContent = 'Failed to fetch stock data';
          errorElement.style.display = 'block';

        case 28:
          _context3.next = 34;
          break;

        case 30:
          _context3.prev = 30;
          _context3.t0 = _context3["catch"](15);
          errorElement.textContent = _context3.t0.message;
          errorElement.style.display = 'block';

        case 34:
          _context3.prev = 34;
          loadingElement.style.display = 'none';
          return _context3.finish(34);

        case 37:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[15, 30, 34, 37]]);
} // Display predictions on the chart


function displayChart(stockData, predictions) {
  var closingPrices = Object.values(stockData).map(function (day) {
    return parseFloat(day['4. close']);
  }).reverse();
  var dates = Object.keys(stockData).reverse();
  var futureDates = Array(7).fill('').map(function (_, i) {
    return "Day ".concat(i + 1);
  });
  var ctx = document.getElementById('myChart').getContext('2d'); // Destroy the previous chart instance if it exists

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [].concat(_toConsumableArray(dates), _toConsumableArray(futureDates)),
      datasets: [{
        label: 'Historical Prices',
        data: closingPrices,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false
      }, {
        label: 'Predicted Prices',
        data: [].concat(_toConsumableArray(Array(closingPrices.length).fill(null)), _toConsumableArray(predictions)),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false
      }]
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price'
          }
        }
      }
    }
  });
} // Display historical and predicted prices in a table


function displayTable(stockData, predictions) {
  var closingPrices = Object.values(stockData).map(function (day) {
    return parseFloat(day['4. close']);
  }).reverse();
  var dates = Object.keys(stockData).reverse();
  var tableBody = document.querySelector('#priceTable tbody');
  var tableViewElement = document.getElementById('tableView');
  dates.forEach(function (date, index) {
    var row = document.createElement('tr');
    var dateCell = document.createElement('td');
    var priceCell = document.createElement('td');
    dateCell.textContent = date;
    priceCell.textContent = closingPrices[index];
    row.appendChild(dateCell);
    row.appendChild(priceCell);
    tableBody.appendChild(row);
  });
  predictions.forEach(function (prediction, index) {
    var row = document.createElement('tr');
    var dateCell = document.createElement('td');
    var priceCell = document.createElement('td');
    dateCell.textContent = "Day ".concat(index + 1);
    priceCell.textContent = prediction;
    row.appendChild(dateCell);
    row.appendChild(priceCell);
    tableBody.appendChild(row);
  });
  tableViewElement.style.display = 'none';
} // Toggle between chart view and table view


function toggleView() {
  var chartViewElement = document.getElementById('chartView');
  var tableViewElement = document.getElementById('tableView');
  var toggleViewButton = document.getElementById('toggleViewButton');

  if (chartViewElement.style.display === 'none') {
    chartViewElement.style.display = 'block';
    tableViewElement.style.display = 'none';
    toggleViewButton.textContent = 'Switch to Table View';
  } else {
    chartViewElement.style.display = 'none';
    tableViewElement.style.display = 'block';
    toggleViewButton.textContent = 'Switch to Chart View';
  }
} // Reset the form to allow new stock symbol input


function resetForm() {
  var stockSymbolInput = document.getElementById('stockSymbol');
  var chartViewElement = document.getElementById('chartView');
  var tableViewElement = document.getElementById('tableView');
  var viewToggleElement = document.getElementById('viewToggle');
  var backButtonContainer = document.getElementById('backButtonContainer');
  var tableBody = document.querySelector('#priceTable tbody');
  stockSymbolInput.value = '';
  chartViewElement.style.display = 'none';
  tableViewElement.style.display = 'none';
  viewToggleElement.style.display = 'none';
  backButtonContainer.style.display = 'none';
  tableBody.innerHTML = ''; // Destroy the chart instance if it exists

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
} // Event listeners


document.getElementById('predictButton').addEventListener('click', function () {
  var symbol = document.getElementById('stockSymbol').value;
  predictStockPrices(symbol);
});
document.getElementById('toggleViewButton').addEventListener('click', toggleView);
document.getElementById('backButton').addEventListener('click', resetForm);
//# sourceMappingURL=script.dev.js.map
