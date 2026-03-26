document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const useLocationBtn = document.getElementById('use-location-btn');
    const saveLocationBtn = document.getElementById('save-location-btn');
    const savedLocationsList = document.getElementById('saved-locations-list');
    
    // Weather display elements
    const cityName = document.getElementById('city-name');
    const currentTemp = document.getElementById('current-temp');
    const weatherDescription = document.getElementById('weather-description');
    const weatherIcon = document.getElementById('weather-icon');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const pressure = document.getElementById('pressure');
    const forecastContainer = document.getElementById('forecast-container');
    
    // Backend API base URL
    const BACKEND = 'https://agri-project-ol6n.onrender.com';
    
    // Current location data
    let currentLocation = null;
    
    // Event Listeners
    searchBtn.addEventListener('click', searchWeather);
    useLocationBtn.addEventListener('click', getLocationWeather);
    saveLocationBtn.addEventListener('click', saveLocation);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchWeather();
    });
    
    // Initialize the page
    loadSavedLocations();
    
    // Functions
    async function searchWeather() {
        const location = locationInput.value.trim();
        if (!location) {
            alert('Please enter a location');
            return;
        }
        
        try {
            const weatherData = await fetchWeather(location);
            displayWeather(weatherData);
            currentLocation = {
                name: weatherData.name,
                country: weatherData.sys.country,
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            alert('Could not fetch weather data. Please try again.');
        }
    }
    
    function getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const weatherData = await fetchWeatherByCoords(latitude, longitude);
                        displayWeather(weatherData);
                        currentLocation = {
                            name: weatherData.name,
                            country: weatherData.sys.country,
                            lat: weatherData.coord.lat,
                            lon: weatherData.coord.lon
                        };
                        locationInput.value = `${weatherData.name}, ${weatherData.sys.country}`;
                    } catch (error) {
                        console.error('Error fetching weather:', error);
                        alert('Could not fetch weather data. Please try again.');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Could not get your location. Please enable location services or enter a location manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }
    
    async function fetchWeather(location) {
        const response = await fetch(
            `${BACKEND}/api/weather?q=${encodeURIComponent(location)}`
        );
        
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        return await response.json();
    }
    
    async function fetchWeatherByCoords(lat, lon) {
        const response = await fetch(
            `${BACKEND}/api/weather?lat=${lat}&lon=${lon}`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not available for this location');
        }
        
        return await response.json();
    }
    
    async function fetchForecast(lat, lon) {
        const response = await fetch(
            `${BACKEND}/api/forecast?lat=${lat}&lon=${lon}`
        );
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        return await response.json();
    }
    
    async function displayWeather(data) {
        // Update current weather
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        currentTemp.textContent = Math.round(data.main.temp);
        weatherDescription.textContent = data.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.alt = data.weather[0].description;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
        pressure.textContent = `${data.main.pressure} hPa`;
        
        // Fetch and display forecast
        try {
            const forecastData = await fetchForecast(data.coord.lat, data.coord.lon);
            displayForecast(forecastData);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            forecastContainer.innerHTML = '<p>Could not load forecast data</p>';
        }
    }
    
    function displayForecast(data) {
        // Group forecast by day
        const dailyForecast = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    temps: [],
                    icons: [],
                    descriptions: []
                };
            }
            
            dailyForecast[day].temps.push(item.main.temp);
            dailyForecast[day].icons.push(item.weather[0].icon);
            dailyForecast[day].descriptions.push(item.weather[0].description);
        });
        
        // Display forecast for next 5 days
        forecastContainer.innerHTML = '';
        const days = Object.keys(dailyForecast).slice(0, 5);
        
        days.forEach(day => {
            const dayData = dailyForecast[day];
            const maxTemp = Math.round(Math.max(...dayData.temps));
            const minTemp = Math.round(Math.min(...dayData.temps));
            // Use the most frequent icon or the first one
            const icon = mode(dayData.icons) || dayData.icons[0];
            const description = mode(dayData.descriptions) || dayData.descriptions[0];
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${day}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                </div>
                <div class="forecast-temp">
                    <span class="max-temp">${maxTemp}°</span>
                    <span class="min-temp">${minTemp}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
    }
    
    function mode(array) {
        if (array.length === 0) return null;
        
        const frequencyMap = {};
        let maxCount = 0;
        let modeValue = array[0];
        
        array.forEach(value => {
            frequencyMap[value] = (frequencyMap[value] || 0) + 1;
            if (frequencyMap[value] > maxCount) {
                maxCount = frequencyMap[value];
                modeValue = value;
            }
        });
        
        return modeValue;
    }
    
    async function loadSavedLocations() {
        try {
            // Call your backend API to get saved locations
            const response = await fetch('https://agri-project-ol6n.onrender.com/api/locations');
            if (!response.ok) throw new Error('Failed to load saved locations');
            
            const locations = await response.json();
            renderSavedLocations(locations);
        } catch (error) {
            console.error('Error loading saved locations:', error);
        }
    }
    
    function renderSavedLocations(locations) {
        savedLocationsList.innerHTML = '';
        
        locations.forEach(location => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${location.name}, ${location.country}</span>
                <button class="delete-btn" data-id="${location._id}">×</button>
            `;
            
            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    locationInput.value = `${location.name}, ${location.country}`;
                    searchWeather();
                }
            });
            
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await deleteLocation(location._id);
            });
            
            savedLocationsList.appendChild(li);
        });
    }
    
    async function saveLocation() {
        if (!currentLocation) {
            alert('No location to save. Please search for a location first.');
            return;
        }
        
        try {
            // Call your backend API to save the location
            const response = await fetch('https://agri-project-ol6n.onrender.com/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentLocation)
            });
            
            if (!response.ok) throw new Error('Failed to save location');
            
            const savedLocation = await response.json();
            loadSavedLocations(); // Refresh the list
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Could not save location. Please try again.');
        }
    }
    
    async function deleteLocation(id) {
        try {
            // Call your backend API to delete the location
            const response = await fetch(`https://agri-project-ol6n.onrender.com/api/locations/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete location');
            
            loadSavedLocations(); // Refresh the list
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Could not delete location. Please try again.');
        }
    }
});