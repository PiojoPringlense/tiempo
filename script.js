import { conditions } from "./conditions.js";

//API data for the weather info
const API_KEY = '8d2209cf973347e7b7bbfd5c964f3b10821fcee21444abb45ddb0139a150fbc1'
const API_URL_14DAYS = `https://api.meteo-concept.com/api/forecast/daily?token=${API_KEY}&insee=78297`
const API_URL_14DAYS_QUARTERS = `https://api.meteo-concept.com/api/forecast/daily/periods?token=${API_KEY}&insee=78297`
const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]


//DOM elements details
const Tcurrent = document.querySelector('.t-curr')
const tmax = document.getElementById('tmax')
const tmin = document.getElementById('tmin')
const rain_proba = document.getElementById('rain_proba')
const rain_total = document.getElementById('rain_total')
const sun_time = document.getElementById('sun_time')
const icon = document.getElementById('icon')
const weather_description = document.querySelector('.weather_description')
const date = document.querySelector('.date')
const hour = document.querySelector('.hour')

//DOM elements quarters
const container = document.querySelector('.quarterly')
const templateDay = document.querySelector('[data-day]')
const templateQuarter = document.querySelector('[data-quarter]')


function getWeatherData(){
    
  
    const weather14Days = getWeather(API_URL_14DAYS)

    const weather14DaysQuarterly = getWeather(API_URL_14DAYS_QUARTERS)
    
    
    Promise.all([weather14Days,weather14DaysQuarterly]).then(sols => {
        let weatherData = {}
        weatherData.daily = sols[0]
        weatherData.quarterly = sols[1]
        console.log(weatherData)
        updateDataDetails(weatherData,0,getPeriod())
        updateDataQuarters(weatherData)
        }
    )

    // Get weather data and retourns an object with dayly and quarterly data for the next 14 days
    function getWeather(api) {
        return fetch(api)
            .then(res_forecast => res_forecast.json())
            .then(data_forecast => {
                return data_forecast.forecast
            })
    }

    function getPeriod(){
        const d = new Date()
        const currentTime = d.getHours()
        return Math.abs(Math.trunc((currentTime - 2)/6))
    }

    function updateDataDetails(weatherData, day, period){
        Tcurrent.innerHTML = weatherData.quarterly[day][period].temp2m + '°'
        tmax.innerHTML = weatherData.daily[day].tmax + '°'
        tmin.innerHTML = weatherData.daily[day].tmin + '°'
        rain_proba.innerHTML = weatherData.quarterly[day][period].probarain + '%'
        rain_total.innerHTML = weatherData.quarterly[day][period].rr10 + 'mm'
        sun_time.innerHTML = weatherData.daily[day].sun_hours + 'h'
        icon.src = conditions[weatherData.daily[day].weather].icon
        weather_description.innerText = conditions[weatherData.daily[day].weather].tiempo

        const d = new Date(weatherData.quarterly[day][period].datetime)
        date.innerText = weekDays[d.getDay()] + " " + d.getDate()
        hour.innerText = d.getHours() + "h - " + (d.getHours() + 6) +"h"
    }

    function updateDataQuarters(weatherData){
        weatherData.daily.forEach((dia, i) => {
            const dayNode = templateDay.content.cloneNode(true)
            const d = new Date(dia.datetime)
            dayNode.querySelector('.day_name').innerText = weekDays[d.getDay()]

            weatherData.quarterly[i].forEach((quarter) => {
                const quarterNode = templateQuarter.content.cloneNode(true)
                const d = new Date(quarter.datetime)
                quarterNode.querySelector('.hours').innerText = d.getHours() + 'h'
                quarterNode.querySelector('.temp').innerText = quarter.temp2m + '°'
                quarterNode.querySelector('.rain_prob_bar').innerText = quarter.probarain + '%'
                quarterNode.querySelector('.rain_prob_bar').style = "height:"+ quarter.probarain +"px"
                quarterNode.querySelector('.rain_vol_bar').innerText = quarter.rr10
                quarterNode.querySelector('.rain_vol_bar').style = "height:"+ quarter.rr10*5 +"px"
                quarterNode.querySelector('img').src = conditions[quarter.weather].icon
                
                quarterNode.querySelector('img').addEventListener('click', () => {
                    console.log('click')
                    updateDataDetails(weatherData,quarter.day,quarter.period)
                })

                dayNode.querySelector('.days').appendChild(quarterNode)

            })
            container.appendChild(dayNode)
        })
    }


}

getWeatherData();



// Slider

let isDown = false;
let startX;
let translated;
let maxTranslate;
const slider = document.querySelector('.quarterly');

const end = () => {
    isDown = false;
    slider.classList.remove('active');
    translated = getTranslateX();
}

const start = (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX || e.touches[0].pageX;
    translated = getTranslateX();
    maxTranslate = -1*(slider.offsetWidth - slider.parentElement.offsetWidth);
}

const move = (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX;
    const dist = (x - startX);
    let translate = Math.min(Math.max(translated + dist, maxTranslate), 0)
    slider.style.transform = "translateX("+translate+"px)";
}

function getTranslateX() {
    var style = window.getComputedStyle(slider);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

(() => {
	slider.addEventListener('mousedown', start);
	slider.addEventListener('touchstart', start);

	slider.addEventListener('mousemove', move);
	slider.addEventListener('touchmove', move);

	slider.addEventListener('mouseleave', end);
	slider.addEventListener('mouseup', end);
	slider.addEventListener('touchend', end);
})();