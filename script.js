/******w**************
    
    Assignment 4
    Name: Samuel Oyedeji
    Date: 2024-06-30
    Description: Air Quality Data

*********************/

// event listener to make the api call
document.getElementById('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const location = document.getElementById('search-location').value.trim();
    if (location) {
        fetchAirQualityData(location);
    } else {
        alert('Please enter a location');
    }
});

// asynchronous function using the async/await
async function fetchAirQualityData(location) {
    const apiUrl = `https://data.winnipeg.ca/resource/f58p-2ju3.json?$where=lower(locationname) LIKE lower('%${location}%')&$order=observationtime DESC&$limit=50`;
    const encodedURL = encodeURI(apiUrl);
    console.log('API URL:', encodedURL);  //

    showLoadingIndicator(true);

    try {
        const res = await fetch(encodedURL);
        
        if (!res.ok) {
            console.error('Fetch error:', res.status, res.statusText);
            alert(`Error: ${res.status} ${res.statusText}`);
            showLoadingIndicator(false);
            return;
        }

        const data = await res.json();
        console.log('Fetched Data:', data);  

        displayResults(data);
        document.getElementById('results').dataset.data = JSON.stringify(data);
    } catch (err) {
        console.error('Fetch error:', err);
        alert(`Error: ${err.message}`);
    } finally {
        showLoadingIndicator(false);
    }
}

// function that injects results into the DOM 
function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (data.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>SN</th>
                <th>Location Name</th>
                <th>Observation Time</th>
                <th>Measurement Type</th>
                <th>Measurement Value</th>
                <th>Measurement Unit</th>
                <th>Latitude</th>
                <th>Longitude</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.locationname || 'N/A'}</td>
            <td>${item.observationtime || 'N/A'}</td>
            <td>${item.measurementtype || 'N/A'}</td>
            <td>${item.measurementvalue || 'N/A'}</td>
            <td>${item.measurementunit || 'N/A'}</td>
            <td>${item.location ? item.location.latitude : 'N/A'}</td>
            <td>${item.location ? item.location.longitude : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    resultsContainer.appendChild(table);
}

// data loading function
function showLoadingIndicator(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (isLoading) {
        loadingIndicator.style.display = 'block';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

// download data event listener
document.getElementById('download-csv-button').addEventListener('click', () => {
    const data = JSON.parse(document.getElementById('results').dataset.data || '[]');
    if (data.length > 0) {
        downloadCSV(data);
    } else {
        alert('No data to download');
    }
});

// download data as CSV  function using the Blob constructor
function downloadCSV(data) {
    const csvContent = [
        ['SN', 'Location Name', 'Observation Time', 'Measurement Type', 'Measurement Value', 'Measurement Unit', 'Latitude', 'Longitude'],
        ...data.map((item, index) => [
            index + 1,
            item.locationname || 'N/A',
            item.observationtime || 'N/A',
            item.measurementtype || 'N/A',
            item.measurementvalue || 'N/A',
            item.measurementunit || 'N/A',
            item.location ? item.location.latitude : 'N/A',
            item.location ? item.location.longitude : 'N/A',
        ])
    ]
    .map(e => e.join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'air_quality_data.csv';
    a.click();
    URL.revokeObjectURL(url);
}
