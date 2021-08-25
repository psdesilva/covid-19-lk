// SELECTING RELEVANT DOM ELEMENTS AND ASSIGNING THEM TO VARIABLES
const twitterFeed = document.querySelector('#twitter');
const totalButton = document.querySelector('#total');
const dailyButton = document.querySelector('#daily');

const casesCard = document.querySelector('#cases-text');
const recoveredCard = document.querySelector('#recovered-text');
const deathsCard = document.querySelector('#deaths-text');

const statsLoader = document.querySelector('#stats-loader');

// INITIALIZING GLOBAL VARIABLES TO STORE VALUES FETCHED FROM API
let dateValues = [];

let dailyCasesArray =[];
let dailyRecoveredArray = [];
let dailyDeathArray = [];

let incrementalCasesArray = [];
let incrementalRecoveredArray = [];
let incrementalDeathArray = [];

let casesOverTime = [];
let recoveredOverTime = [];
let deathOverTime = [];

let dailyCasesOverTime = [];
let dailyRecoveredOverTime = [];
let dailyDeathOverTime = [];

let todayCases = 0;
let todayRecovered = 0;
let todayDeaths = 0;

let totalCases = 0;
let totalRecovered = 0;
let totalDeaths = 0;

let updateTime = '';

// SETTING THE INITIALLY SELECTED BUTTON TO TOTAL BUTTON
let selectedButton = 'totalButton';


// RETRIEVING HISTORICAL API DATA, MANIPULATING IT INTO USABLE DATA STRUCTURES, AND RENDERING THE RELEVANT CHARTS AND CARDS
function loadData() {
    fetch('https://www.hpb.health.gov.lk/api/get-statistical-history-data')
    .then((res) => res.json())
    .then((data) => {
        let statistics = data.data; // Assigning API data to a variable
        statistics.reverse() // Reversing the array of data to order the values chronologically

        // Separating the data into separate arrays for dates, cases, recoveries and deaths
        statistics.forEach(entry => {
            dateValues.push(Date.parse(entry.date))
            dailyCasesArray.push(entry.cases_count)
            dailyRecoveredArray.push(entry.recoveries_count)
            dailyDeathArray.push(entry.deaths_count)
        })

        // Using above arrays to create a new array with incrementing values
        incrementValue(dailyCasesArray, incrementalCasesArray);
        incrementValue(dailyRecoveredArray, incrementalRecoveredArray);
        incrementValue(dailyDeathArray, incrementalDeathArray);

        // Creating an array containing arrays of date and value pairs for total values
        valueOverTime(dateValues, incrementalCasesArray, casesOverTime);
        valueOverTime(dateValues, incrementalRecoveredArray, recoveredOverTime);
        valueOverTime(dateValues, incrementalDeathArray, deathOverTime);

        // Creating an array containing arrays of date and value pairs for daily values
        valueOverTime(dateValues, dailyCasesArray, dailyCasesOverTime);
        valueOverTime(dateValues, dailyRecoveredArray, dailyRecoveredOverTime);
        valueOverTime(dateValues, dailyDeathArray, dailyDeathOverTime);

        // Drawing the chart for total statistics
        drawChart(`TOTAL STATISTICS as of ${updateTime}`, "Total Cases", casesOverTime, "Total Recovered", recoveredOverTime, "Total Deaths", deathOverTime, 1, 2);

        // Assigning daily values to variables and formatting to include commas appropirately 
        let todayCasesRaw = statistics[statistics.length-1].cases_count;
        todayCases = numberWithCommas(todayCasesRaw);
        let todayRecoveredRaw = statistics[statistics.length-1].recoveries_count;
        todayRecovered = numberWithCommas(todayRecoveredRaw);
        let todayDeathsRaw = statistics[statistics.length-1].deaths_count;
        todayDeaths = numberWithCommas(todayDeathsRaw);

    })
}

// RETRIEVING CURRENT API DATA, MANIPULATING IT INTO USABLE DATA STRUCTURES, AND RENDERING THE RELEVANT CARDS
function loadCurrentData() {
    fetch('https://hpb.health.gov.lk/api/get-current-statistical')
    .then((res) => res.json())
    .then((data) => {
        let apiStatistics = data.data; // Assigning API data to a variable

        // Rendering the update time of the data
        updateTime = apiStatistics.update_date_time;
        document.querySelector('#chart-header').innerText = `Updated at: ${updateTime}`;

        // Assigning total values to variables and formatting to include commas appropirately 
        let totalCasesRaw = apiStatistics.local_total_cases;
        totalCases = numberWithCommas(totalCasesRaw);
        let totalRecoveredRaw = apiStatistics.local_recovered;
        totalRecovered = numberWithCommas(totalRecoveredRaw);
        let totalDeathsRaw = apiStatistics.local_deaths;
        totalDeaths = numberWithCommas(totalDeathsRaw);

        // Updating the HTML cards using the above values
        casesCard.innerHTML = `<h2>Total Cases:&nbsp;</h2><p>${totalCases}</p>`;
        recoveredCard.innerHTML = `<h2>Total Recovered:&nbsp;</h2><p>${totalRecovered}</p>`;
        deathsCard.innerHTML = `<h2>Total Deaths:&nbsp;</h2><p>${totalDeaths}</p>`;

        // Removing the loading spinner
        statsLoader.parentNode.removeChild(statsLoader);

        // Fading in the elements
        document.querySelector('#buttons').classList.add('full-opacity');
        document.querySelector('#numerical-stats').classList.add('full-opacity');
        document.querySelector('#charts').classList.add('full-opacity');
    })
}

// ADDING COMMAS TO LARGE NUMBERS TO ENHANCE READABILITY
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// CALLING THE ABOVE FUNCTIONS 
loadCurrentData();
loadData();

let totalChartIsVisible = true;
let dailyChartIsVisible = false;

// LISTENING FOR TOTAL BUTTON CLICK EVENT
totalButton.addEventListener('click', () => {
  
    // Displaying total chart
    document.querySelector('#chart-1').style.display = 'block';
    document.querySelector('#chart-2').style.display = 'none';

    // Updating the cards to display total values
    casesCard.innerHTML = `<h2>Total Cases:&nbsp;</h2><p>${totalCases}</p>`;
    recoveredCard.innerHTML = `<h2>Total Recovered:&nbsp;</h2><p>${totalRecovered}</p>`;
    deathsCard.innerHTML = `<h2>Total Deaths:&nbsp;</h2><p>${totalDeaths}</p>`;

    // Setting selected button to total button
    selectedButton = 'totalButton';

    // Adding 'selected' and 'hover' states to buttons
    if (selectedButton == 'totalButton') {
      totalButton.classList.add('selected-button');
      totalButton.classList.remove('unselected-button');
      dailyButton.classList.add('unselected-button');
      dailyButton.classList.remove('selected-button');
    } else {
      totalButton.classList.add('unselected-button');
      totalButton.classList.remove('selected-button');
      dailyButton.classList.add('selected-button');
      dailyButton.classList.remove('unselected-button');
    }
});

// LISTENING FOR DAILY BUTTON CLICK EVENT
dailyButton.addEventListener('click', () => {

  // Displaying daily chart
    document.querySelector('#chart-1').style.display = 'none';
    document.querySelector('#chart-2').style.display = 'block';

    // Drawing the chart for daily statistics
    if (dailyChartIsVisible == false) {
        drawChart(`DAILY STATISTICS as of ${updateTime}`, "Daily Cases", dailyCasesOverTime, "Daily Recovered", dailyRecoveredOverTime, "Daily Deaths", dailyDeathOverTime, 2, 1);
        dailyChartIsVisible = true;
    }

    // Updating the cards to display daily values
    casesCard.innerHTML = `<h2>Daily Cases:&nbsp;</h2><p>${todayCases}</p>`;
    recoveredCard.innerHTML = `<h2>Daily Recovered:&nbsp;</h2><p>${todayRecovered}</p>`;
    deathsCard.innerHTML = `<h2>Daily Deaths:&nbsp;</h2><p>${todayDeaths}</p>`;

    // Setting selected button to daily button
    selectedButton = 'dailyButton';

    // Adding 'selected' and 'hover' states to buttons
    if (selectedButton == 'totalButton') {
      totalButton.classList.add('selected-button');
      totalButton.classList.remove('unselected-button');
      dailyButton.classList.add('unselected-button');
      dailyButton.classList.remove('selected-button');
    } else {
      totalButton.classList.add('unselected-button');
      totalButton.classList.remove('selected-button');
      dailyButton.classList.add('selected-button');
      dailyButton.classList.remove('unselected-button');
    }
});




// ADDING ARRAY VALUES INCREMENTALLY AND POPULATING A NEW ARRAY
function incrementValue(array, newArray) {
    let currentValue = 0
    for(let i = 0; i < array.length; i++) {
        currentValue = array[i] + currentValue;
        newArray.push(currentValue);
    }
}

// ITERATING THROUGH TWO ARRAYS AND GRABBING THE VALUES AT THE SAME INDEX, USING THOSE VALUES TO CREATE AN ARRAY OF THOSE TWO VALUES, AND PUSHING EACH OF THOSE ARRAYS TO A DEFINED THIRD ARRAY
function valueOverTime (dateArray, valueArray, valueOverTimeArray) {
    for (let i=0; i<dateArray.length; i++) {
        valueOverTimeArray.push([dateArray[i], valueArray[i]]);
    }
}

// FUNCTION FOR DRAWING A CHART USING APEXCHARTS
function drawChart(titleText, casesText, cases, recoveredText, recovered, deathText, deaths, chartId, strokeWidth) {
var options = {
    chart: {
      height: '530',
      width: "100%",
      type: "area",
      parentHeightOffset: 0,
      animations: {
        initialAnimation: {
          enabled: true
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    series: [
      {
        name: casesText, // The label of the cases (Total cases / Daily cases)
        data: cases // The array containing cases data and timestamps (casesOvertime / dailyCasesOverTime)
      },
      {
        name: recoveredText, // The label of the recovered (Total recovered / Daily recovered)
        data: recovered // The array containing recovered data and timestamps (recoveredOvertime / dailyRecoveredOverTime)
      },
      {
        name: deathText, // The label of the deaths (Total deaths / Daily deaths)
        data: deaths // The array containing deaths data and timestamps (deathsOvertime / dailyDeathsOverTime)
      }
    ],
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'rgb(90, 90, 90)'
        }
      }
    },
    dataLabels: {
        enabled: false
    },
    fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: strokeWidth, // Width of the stroke can be varied by providing this parameter when calling the drawChart function
        dashArray: 0,      
    },
    yaxis: {
      labels: {
        style: {
          colors: 'rgb(90, 90, 90)'
        }
      }
    },
    legend: {
        itemMargin: {
            horizontal: 20,
            vertical: 20
        },
        labels: {
          colors: 'rgb(90, 90, 90)'
        }
    },
    colors: ['#2E93fA', '#35b34a', '#FF4560']
  };
  
  var chart = new ApexCharts(document.querySelector(`#chart-${chartId}`), options); // chartID identifies the chart as total (1) or daily (2)
  
  chart.render();
}