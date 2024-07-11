let chartInstance = null;  // Global variable to keep track of the Chart.js instance

// Fetch historical stock data from Alpha Vantage API with rate limit handling
async function fetchStockData(symbol) {
    const apiKey = 'W69SKYDC7J7YHF46';  // Replace with your Alpha Vantage API key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        
        // Check if response status indicates a rate limit error
        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait and try again.');
        }
        
        const data = await response.json();
        console.log("Fetched stock data:", data);  // Debugging output
        
        if (data['Time Series (Daily)']) {
            return data['Time Series (Daily)'];
        } else {
            throw new Error(data['Note'] || 'Failed to retrieve data');
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

// Use ChatGPT to predict future stock prices
async function predictStockPricesWithChatGPT(symbol, historicalData) {
    const apiKey = 'sk-proj-5juprBo9dw9wdpOq5opJT3BlbkFJA2aOYGK54Ia0Udb3rSXM';  // Replace with your OpenAI API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';  // OpenAI Chat API URL

    // Format the historical data as input for ChatGPT
    const closingPrices = Object.values(historicalData).map(day => parseFloat(day['4. close'])).reverse();
    const prompt = `Given the following closing prices for stock ${symbol}: ${closingPrices.join(', ')}, predict the next 7 days of closing prices. Please provide the prices as a comma-separated list.`;

    console.log("Prompt for GPT-3:", prompt);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 100,  // Adjust as needed
                temperature: 0.5
            })
        });

        const data = await response.json();
        console.log("GPT-3 response:", data);  // Debugging output

        if (data.choices && data.choices.length > 0) {
            const predictionText = data.choices[0].message.content.trim();
            const predictions = predictionText.split(',').map(price => parseFloat(price.trim()));
            console.log("Predictions:", predictions);
            return predictions;
        } else {
            throw new Error("Invalid GPT-3 response");
        }
    } catch (error) {
        console.error('Error predicting stock prices with ChatGPT:', error);
        throw error;
    }
}

// Main function to handle the prediction
async function predictStockPrices(symbol) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const resultElement = document.getElementById('result');
    const tableBody = document.querySelector('#priceTable tbody');
    const viewToggleElement = document.getElementById('viewToggle');
    const chartViewElement = document.getElementById('chartView');
    const tableViewElement = document.getElementById('tableView');
    const backButtonContainer = document.getElementById('backButtonContainer');

    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    tableBody.innerHTML = '';
    chartViewElement.style.display = 'none';
    tableViewElement.style.display = 'none';
    viewToggleElement.style.display = 'none';
    backButtonContainer.style.display = 'none';

    try {
        const stockData = await fetchStockData(symbol);
        if (stockData) {
            const predictions = await predictStockPricesWithChatGPT(symbol, stockData);
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
        } else {
            errorElement.textContent = 'Failed to fetch stock data';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Display predictions on the chart
function displayChart(stockData, predictions) {
    const closingPrices = Object.values(stockData).map(day => parseFloat(day['4. close'])).reverse();
    const dates = Object.keys(stockData).reverse();

    const futureDates = Array(7).fill('').map((_, i) => `Day ${i + 1}`);
    
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Destroy the previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...dates, ...futureDates],
            datasets: [
                {
                    label: 'Historical Prices',
                    data: closingPrices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Predicted Prices',
                    data: [...Array(closingPrices.length).fill(null), ...predictions],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
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
}

// Display historical and predicted prices in a table
function displayTable(stockData, predictions) {
    const closingPrices = Object.values(stockData).map(day => parseFloat(day['4. close'])).reverse();
    const dates = Object.keys(stockData).reverse();

    const tableBody = document.querySelector('#priceTable tbody');
    const tableViewElement = document.getElementById('tableView');

    dates.forEach((date, index) => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const priceCell = document.createElement('td');

        dateCell.textContent = date;
        priceCell.textContent = closingPrices[index];

        row.appendChild(dateCell);
        row.appendChild(priceCell);
        tableBody.appendChild(row);
    });

    predictions.forEach((prediction, index) => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const priceCell = document.createElement('td');

        dateCell.textContent = `Day ${index + 1}`;
        priceCell.textContent = prediction;

        row.appendChild(dateCell);
        row.appendChild(priceCell);
        tableBody.appendChild(row);
    });

    tableViewElement.style.display = 'none';
}

// Toggle between chart view and table view
function toggleView() {
    const chartViewElement = document.getElementById('chartView');
    const tableViewElement = document.getElementById('tableView');
    const toggleViewButton = document.getElementById('toggleViewButton');

    if (chartViewElement.style.display === 'none') {
        chartViewElement.style.display = 'block';
        tableViewElement.style.display = 'none';
        toggleViewButton.textContent = 'Switch to Table View';
    } else {
        chartViewElement.style.display = 'none';
        tableViewElement.style.display = 'block';
        toggleViewButton.textContent = 'Switch to Chart View';
    }
}

// Reset the form to allow new stock symbol input
function resetForm() {
    const stockSymbolInput = document.getElementById('stockSymbol');
    const chartViewElement = document.getElementById('chartView');
    const tableViewElement = document.getElementById('tableView');
    const viewToggleElement = document.getElementById('viewToggle');
    const backButtonContainer = document.getElementById('backButtonContainer');
    const tableBody = document.querySelector('#priceTable tbody');

    stockSymbolInput.value = '';
    chartViewElement.style.display = 'none';
    tableViewElement.style.display = 'none';
    viewToggleElement.style.display = 'none';
    backButtonContainer.style.display = 'none';
    tableBody.innerHTML = '';
    
    // Destroy the chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

// Event listeners
document.getElementById('predictButton').addEventListener('click', () => {
    const symbol = document.getElementById('stockSymbol').value;
    predictStockPrices(symbol);
});

document.getElementById('toggleViewButton').addEventListener('click', toggleView);

document.getElementById('backButton').addEventListener('click', resetForm);
