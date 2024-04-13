document.addEventListener('DOMContentLoaded', function () {
    fetch('website_time_spent.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Parse the CSV data and create the chart
            createChart(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    fetch('Category_time_spent.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data2 => {
            // Parse the CSV data and create the chart
            createChart2(data2);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Function to fetch total time from the server and update UI
    function fetchTotalTime() {
        fetch('http://127.0.0.1:5000/get_total_time')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update the HTML content and add classes
                const totalTimeDisplay = document.getElementById('totalTimeDisplay');
                totalTimeDisplay.innerHTML = `
                <h2 class="lighter">Total Time:</h2>
                <p class="bold">${data.total_time}</p>`;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    // Call fetchTotalTime function when the extension popup is opened
    fetchTotalTime();

    function createChart(csvData) {
        const rows = csvData.split('\n').slice(1); // Skip header row
        let websiteData = {};

        // Extract data for each website
        rows.forEach(row => {
            const columns = row.split(',');
            const website = columns[0];
            const timeSpent = parseInt(columns[1]);

            // Store data for each website
            websiteData[website] = timeSpent;
        });

        // Sort websites based on time spent
        const sortedWebsites = Object.keys(websiteData).sort((a, b) => websiteData[b] - websiteData[a]);

        // Take the top 5 websites
        const top5Websites = sortedWebsites.slice(0, 5);

        // Prepare labels and data for the chart
        const labels = top5Websites;
        const data = top5Websites.map(website => websiteData[website]);

        // Define the colors from your hardcoded dataset
        const backgroundColors = [
            'rgba(255, 109, 141, 0.6)',
            'rgba(57, 174, 250, 0.6',
            'rgba(255, 215, 91, 0.6)',
            'rgba(79, 201, 201, 0.6)',
            'rgba(158, 110, 255, 0.6)'
        ];
        const borderColors = [
            'rgba(255, 109, 141, 1)',
            'rgba(57, 174, 250, 1',
            'rgba(255, 215, 91, 1)',
            'rgba(79, 201, 201, 1)',
            'rgba(158, 110, 255, 1)'
        ];

        // Create the chart using predefined colors
        const ctx = document.getElementById('Barchart').getContext('2d');
        const Barchart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'BrowseWise',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1.25
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 Websites', // Add the title here
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Websites',
                            font: {
                                weight: 'bold' // Making the title bold
                            },
                            align: 'center'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Spent',
                        }
                    }
                }
            }
        });
    }

    function createChart2(csvData) {
        const rows = csvData.split('\n').slice(1); // Skip header row
        let websiteData = {};

        // Extract data for each website
        rows.forEach(row => {
            const columns = row.split(',');
            const website = columns[0];
            const timeSpent = parseInt(columns[1]);

            // Store data for each website
            websiteData[website] = timeSpent;
        });

        // Sort websites based on time spent
        const sortedWebsites = Object.keys(websiteData).sort((a, b) => websiteData[b] - websiteData[a]);

        // Take the top 5 websites
        const top5Websites = sortedWebsites.slice(0, 5);

        // Prepare labels and data for the chart
        const labels = top5Websites;
        const data = top5Websites.map(website => websiteData[website]);

        // Define the colors from your hardcoded dataset
        const backgroundColors = [
            'rgba(130, 106, 255, 0.6)',
            'rgba(62, 175, 235, 0.6)',
            'rgba(90, 255, 196, 0.6)',
            'rgba(192, 83, 192, 0.6)',
            'rgba(160, 255, 102, 0.6)'
        ];
        const borderColors = [
            'rgba(130, 106, 255, 1)',
            'rgba(62, 175, 235, 1)',
            'rgba(90, 255, 196, 1)',
            'rgba(192, 83, 192, 1)',
            'rgba(160, 255, 102, 1)'
        ];

        // Create the chart using predefined colors
        const ctx = document.getElementById('DonutChart').getContext('2d');
        const DonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'BrowseWise',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors, // Add borderColor property
                    borderWidth: 1.25 // Add borderWidth property
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 Categories',
                        font: {
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
});