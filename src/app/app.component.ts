import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as Highcharts from 'highcharts';
import HC_3d from 'highcharts/highcharts-3d';
import * as L from 'leaflet';
// require('leaflet-openweathermap');
HC_3d(Highcharts);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'weatherft';
  selectedOption: string = 'metric';
  weatherData: any;
  notFound: boolean = false;
  presentData: boolean = false;
  city: any;
  date: any;
  iconCode: any;
  maintemp: any;
  country: any;
  city1: any;
  feeltemp: any;
  main: any;
  description: any;
  windSpeed: any;
  visibility: any;
  humidity: any;
  pressure: any;
  tempMin: any;
  tempMax: any;
  aggregatedForecast: any[] = [];
  showOtherContent: boolean = false;
  selectedDate: string = ''; 
  selectedDateIndex: number = -1;
  selectedDateData: any[] = [];
  chart: any;
  showTooltip: boolean = false;
  map: L.Map;

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit(): void {
  }

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  handleListItemClick(date,index) {
    this.showOtherContent = true;
    this.selectedDate = date; 
    this.selectedDateIndex = index; 
    this.selectedDateData = this.aggregatedForecast.filter(day => this.formatDate1(day.dt_txt) === date);
  }


  handleListItemCheck(date,index) {
    if (index === this.selectedDateIndex) {
      this.showOtherContent = false; 
    } else {
      this.selectedDateIndex = index;
      this.selectedDateData = this.aggregatedForecast.filter(day => this.formatDate1(day.dt_txt) === date);
    }
  }
  
  return(){
    this.showOtherContent = false;
  }

  searchCity() {
    const apiKey = '6baa4cf0a9e19008c8eb6782d4251c19';
    const city = this.city;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    if (this.map) {
      this.map.remove();
    }
    this.aggregatedForecast = [];
    this.http.get(apiUrl).subscribe(
      (data) => {
        this.weatherData = data;
        this.presentData = true;
        this.updateWeatherData(this.weatherData);
        this.aggregateForecast(this.weatherData.list);
        this.createBarGraph(this.weatherData);       
      },
      (error) => {
        console.error('Error fetching weather data:', error);
        this.notFound = true;
        this.presentData = true;
      }
    );
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {    
      const lat = data.city.coord.lat;
      const lon = data.city.coord.lon;
      this.map = L.map('map').setView([lat, lon], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);    
      const marker = L.marker([lat, lon]).addTo(this.map);
      const weather = data.list[0].weather[0].description;
      const windSpeed = data.list[0].wind.speed;
      const humidity = data.list[0].main.humidity;
      const windColor = this.getColorForWindSpeed(windSpeed);
      const humidityColor = this.getColorForHumidity(humidity);
      L.circleMarker([lat, lon], {
        radius: 50,
        fillColor: windColor, 
        color: 'transparent',
        fillOpacity: 0.3
      }).addTo(this.map);
      L.circleMarker([lat, lon], {
        radius: 80,
        fillColor: humidityColor, 
        color: 'transparent',
        fillOpacity: 0.3
      }).addTo(this.map);
      const temperature = (data.list[0].main.temp - 273.15).toFixed(1);
      const popupContent = `<b>${city}</b><br>Weather: ${weather}<br>Temperature: ${temperature}°C<br>Humidity: ${humidity}%<br>Wind Speed: ${windSpeed} m/s`;
      marker.bindPopup(popupContent).openPopup();      
    })
    .catch(error => console.error('Error fetching weather data:', error));
  }
  
  getColorForWindSpeed(speed: number): string {
    if (speed < 2) {
      return 'green';
    } else if (speed >= 2 && speed < 4) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
  
  getColorForHumidity(humidity: number): string {
    if (humidity < 30) {
      return 'blue';
    } else if (humidity >= 30 && humidity < 70) {
      return 'green';
    } else {
      return 'red';
    }
  }

  aggregateForecast(forecastList){
    const dateTimeMap = new Map<string, any>(); 
    forecastList.forEach((forecast) => {
      const dateTime = forecast.dt_txt.split(" ")[0]; 
      dateTimeMap.set(dateTime, forecast); 
    });
    dateTimeMap.forEach((value, key) => {
      this.aggregatedForecast.push(value);
    });
    this.createLineGraph(this.aggregatedForecast)
    return this.aggregatedForecast;
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const apiKey = '6baa4cf0a9e19008c8eb6782d4251c19';
          const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
          if (this.map) {
            this.map.remove();
          }
          this.aggregatedForecast = [];
          this.http.get(apiUrl).subscribe(
            (data) => {
              this.weatherData = data;
              this.updateWeatherData(this.weatherData);
              this.aggregateForecast(this.weatherData.list);
              this.createBarGraph(this.weatherData);
              fetch(apiUrl)
              .then(response => response.json())
              .then(data => {    
                const city=data.city.name;
                const lat = data.city.coord.lat;
                const lon = data.city.coord.lon;
                this.map = L.map('map').setView([lat, lon], 10);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);    
                const marker = L.marker([lat, lon]).addTo(this.map);
                const weather = data.list[0].weather[0].description;
                const windSpeed = data.list[0].wind.speed;
                const humidity = data.list[0].main.humidity;
                const windColor = this.getColorForWindSpeed(windSpeed);
                const humidityColor = this.getColorForHumidity(humidity);
                L.circleMarker([lat, lon], {
                  radius: 50,
                  fillColor: windColor, 
                  color: 'transparent',
                  fillOpacity: 0.3
                }).addTo(this.map);
                L.circleMarker([lat, lon], {
                  radius: 80,
                  fillColor: humidityColor, 
                  color: 'transparent',
                  fillOpacity: 0.3
                }).addTo(this.map);
                const temperature = (data.list[0].main.temp - 273.15).toFixed(1);
                const popupContent = `<b>${city}</b><br>Weather: ${weather}<br>Temperature: ${temperature}°C<br>Humidity: ${humidity}%<br>Wind Speed: ${windSpeed} m/s`;
                marker.bindPopup(popupContent).openPopup();      
              })
              .catch(error => console.error('Error fetching weather data:', error));
            },
            (error) => {
              console.error('Error fetching weather data:', error);
              this.notFound = true;
            }
          );
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
    
  }

  updateWeatherData(weatherData) {
    this.date = this.formatDate(weatherData.list[0].dt_txt);
    this.iconCode = weatherData.list[0].weather[0].icon;
    this.maintemp = Math.round(weatherData.list[0].main.temp - 273.15);
    this.feeltemp = Math.round(weatherData.list[0].main.feels_like  - 273.15);
    this.main = weatherData.list[0].weather[0].main;
    this.description = weatherData.list[0].weather[0].description.toUpperCase();
    this.city1 = weatherData.city.name;
    this.country = weatherData.city.country;
    this.windSpeed =  weatherData.list[0].wind.speed;
    this.visibility = weatherData.list[0].visibility/1000;
    this.humidity = weatherData.list[0].main.humidity;
    this.pressure = weatherData.list[0].main.pressure;
    this.tempMin = Math.round(weatherData.list[0].main.temp_min - 273.15);
    this.tempMax = Math.round(weatherData.list[0].main.temp_max - 273.15);
    this.notFound = false;
    this.presentData = true;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return this.datePipe.transform(date, 'MMM dd, hh:mma');
  }

  formatDate1(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

  getWeatherIcon() {
    switch (this.iconCode) {
      case '01d':
        return 'fas fa-sun';
      case '01n':
        return 'fas fa-moon';
      case '02d':
      case '02n':
        return 'fas fa-cloud-sun';
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return 'fas fa-cloud';
    }
  }

  getDisplayDates(): number[] {
    if (this.selectedDateIndex === -1) {
      return [];
    }
    const startIndex = Math.max(0, this.selectedDateIndex - 1);
    const endIndex = Math.min(this.aggregatedForecast.length - 1, this.selectedDateIndex + 1);
    return Array.from({length: endIndex - startIndex + 1}, (_, i) => startIndex + i);
  }
  

  convertTemperature(temp) {
    return Math.round(temp - 273.15);
  }

  getWeatherIcon1(iconCode) {
    switch (iconCode) {
      case '01d':
        return 'fas fa-sun';
      case '01n':
        return 'fas fa-moon';
      case '02d':
      case '02n':
        return 'fas fa-cloud-sun';
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return 'fas fa-cloud';
    }
  }

  createBarGraph(weatherData): void {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().slice(0, 10); 
    const currentDateString1 = this.datePipe.transform(currentDate, 'd MMMM yyyy');
    const titleText = 'Weather Data for ' + currentDateString1;
    const labels: string[] = [];
    const temperatures: number[] = [];
    const clouds: number[] = [];
    const humidities: number[] = [];
    const windSpeeds: number[] = [];
  
    weatherData.list.forEach((forecast) => {
      const forecastDate = forecast.dt_txt.split(' ')[0];
      if (forecastDate === currentDateString) {
        labels.push(forecast.dt_txt.split(' ')[1].slice(0, 5)); 
        const temperatureCelsius = Math.round(forecast.main.temp - 273.15);
        temperatures.push(temperatureCelsius);
        clouds.push(forecast.clouds.all)
        humidities.push(forecast.main.humidity);
        windSpeeds.push(forecast.wind.speed);
      }
    });
    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        options3d: {
          enabled: true,
          alpha: 5,
          beta: 25,
          depth: 70,
          viewDistance: 25 
        },
        backgroundColor: 'transparent'
      },
      title: {
        text: titleText
      },
      xAxis: {
        categories: labels,
        title: {
          text: 'Time'
        }
      },
      yAxis: [
        {
          title: {
            text: 'Temperature (C)'
          }
        },
        {
          title: {
            text: 'Clouds (%)'
          }
        },
        {
          title: {
            text: 'Humidity (%)'
          }
        },
        {
          title: {
            text: 'Wind Speed (m/s)'
          },
          opposite: true
        }
      ],
      plotOptions: {
        series: {
          borderWidth: 0 
        }
      },
      series: [
        {
          type: 'column',
          name: 'Temperature (C)',
          data: temperatures,
          color: '#FFA500',
          animation: {
            duration: 1000 
          }
        },
        {
          type: 'column',
          name: 'Clouds (%)',
          data: clouds,
          color: '#87CEEB',
          animation: {
            duration: 1000
          }
        },
        {
          type: 'line',
          name: 'Humidity (%)',
          data: humidities,
          yAxis: 2,
          color: '#00FF00',
          animation: {
            duration: 1000
          }
        },
        {
          type: 'line',
          name: 'Wind Speed (m/s)',
          data: windSpeeds,
          yAxis: 3,
          color: '#FF0000',
          animation: {
            duration: 1000
          }
        }
      ]
    };
    Highcharts.chart('container', options);
  }
  
  createLineGraph(aggregatedForecast) {
    const options: Highcharts.Options = {
      chart: {
        type: 'line',      
        backgroundColor: 'transparent'
      },
      title: {
        text: '6-Day Forecast'
      },
      xAxis: {
        categories: aggregatedForecast.map(day => this.formatDate1(day.dt_txt)),
        title: {
          text: 'Date'
        }
      },
      yAxis: [{
        title: {
          text: 'Temperature (°C)'
        },
        gridLineWidth: 0,
        gridLineColor: 'transparent'
      }, {
        title: {
          text: 'Wind Speed (m/s)'
        },
        opposite: true,
        gridLineWidth: 0,
        gridLineColor: 'transparent'
      }, {
        title: {
          text: 'Clouds (%)'
        },
        gridLineWidth: 0,
        gridLineColor: 'transparent'
      }],
      plotOptions: {
        series: {
          borderWidth: 0 
        }
      },
      series: [{
        type: 'line',
        name: 'Temperature',
        color: '#FFA500',
        yAxis: 0,
        lineWidth: 3,
        data: aggregatedForecast.map(day => this.convertTemperature(day.main.temp))
      }, {
        type: 'line',
        name: 'Wind Speed',
        color: '#87CEEB',
        yAxis: 1,
        lineWidth: 3,
        data: aggregatedForecast.map(day => day.wind.speed)
      }, {
        type: 'line',
        name: 'Clouds',
        color: '#00FF00',
        yAxis: 2,
        lineWidth:3, 
        data: aggregatedForecast.map(day => day.clouds.all)
      }]
    };

    Highcharts.chart('lineContainer', options);
    const lineContainer = document.getElementById('lineContainer');
    if (lineContainer) {
      lineContainer.classList.remove('hidden');
    }
  }

}
