const twitterFeed = document.querySelector('#twitter');
const totalButton = document.querySelector('#total');
const dailyButton = document.querySelector('#daily');

const casesCard = document.querySelector('#cases-text');
const recoveredCard = document.querySelector('#recovered-text');
const deathsCard = document.querySelector('#deaths-text');

const statsLoader = document.querySelector('#stats-loader');

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

let selectedButton = 'totalButton';


//retrieves API data, manipulates it into usable data structures, and renders the necessary charts
function loadData() {
    fetch('https://www.hpb.health.gov.lk/api/get-statistical-history-data')
    .then((res) => res.json())
    .then((data) => {
        let statistics = data.data; 
        statistics.reverse()

        statistics.forEach(entry => {
            dateValues.push(Date.parse(entry.date))
            dailyCasesArray.push(entry.cases_count)
            dailyRecoveredArray.push(entry.recoveries_count)
            dailyDeathArray.push(entry.deaths_count)
        })
        incrementValue(dailyCasesArray, incrementalCasesArray);
        incrementValue(dailyRecoveredArray, incrementalRecoveredArray);
        incrementValue(dailyDeathArray, incrementalDeathArray);

        valueOverTime(dateValues, incrementalCasesArray, casesOverTime);
        valueOverTime(dateValues, incrementalRecoveredArray, recoveredOverTime);
        valueOverTime(dateValues, incrementalDeathArray, deathOverTime);

        valueOverTime(dateValues, dailyCasesArray, dailyCasesOverTime);
        valueOverTime(dateValues, dailyRecoveredArray, dailyRecoveredOverTime);
        valueOverTime(dateValues, dailyDeathArray, dailyDeathOverTime);

        drawChart(`TOTAL STATISTICS as of ${updateTime}`, "Total Cases", casesOverTime, "Total Recovered", recoveredOverTime, "Total Deaths", deathOverTime, 1, 2);

        let todayCasesRaw = statistics[statistics.length-1].cases_count;
        todayCases = numberWithCommas(todayCasesRaw);
        let todayRecoveredRaw = statistics[statistics.length-1].recoveries_count;
        todayRecovered = numberWithCommas(todayRecoveredRaw);
        let todayDeathsRaw = statistics[statistics.length-1].deaths_count;
        todayDeaths = numberWithCommas(todayDeathsRaw);

    })
}

function loadCurrentData() {
    fetch('https://hpb.health.gov.lk/api/get-current-statistical')
    .then((res) => res.json())
    .then((data) => {
        let apiStatistics = data.data;
        updateTime = apiStatistics.update_date_time;
        document.querySelector('#chart-header').innerText = `Updated at: ${updateTime}`;
        console.log(updateTime);
        let totalCasesRaw = apiStatistics.local_total_cases;
        totalCases = numberWithCommas(totalCasesRaw);
        let totalRecoveredRaw = apiStatistics.local_recovered;
        totalRecovered = numberWithCommas(totalRecoveredRaw);
        let totalDeathsRaw = apiStatistics.local_deaths;
        totalDeaths = numberWithCommas(totalDeathsRaw);
        casesCard.innerHTML = `<h2>Total Cases:&nbsp;</h2><p>${totalCases}</p>`;
        recoveredCard.innerHTML = `<h2>Total Recovered:&nbsp;</h2><p>${totalRecovered}</p>`;
        deathsCard.innerHTML = `<h2>Total Deaths:&nbsp;</h2><p>${totalDeaths}</p>`;
        statsLoader.parentNode.removeChild(statsLoader);
        document.querySelector('#buttons').classList.add('full-opacity');
        document.querySelector('#numerical-stats').classList.add('full-opacity');
        document.querySelector('#charts').classList.add('full-opacity');
    })
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

loadCurrentData();
loadData();


//Listen for button click events
let totalChartIsVisible = true;
let dailyChartIsVisible = false;

totalButton.addEventListener('click', () => {
    document.querySelector('#chart-1').style.display = 'block';
    document.querySelector('#chart-2').style.display = 'none';

    casesCard.innerHTML = `<h2>Total Cases:&nbsp;</h2><p>${totalCases}</p>`;
    recoveredCard.innerHTML = `<h2>Total Recovered:&nbsp;</h2><p>${totalRecovered}</p>`;
    deathsCard.innerHTML = `<h2>Total Deaths:&nbsp;</h2><p>${totalDeaths}</p>`;

    selectedButton = 'totalButton';

    if (selectedButton == 'totalButton') { // Add 'selected' and 'hover' states to buttons
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
})

dailyButton.addEventListener('click', () => {
    document.querySelector('#numerical-stats').classList.remove('full-opacity');
    document.querySelector('#chart-1').style.display = 'none';
    document.querySelector('#chart-2').style.display = 'block';

    if (dailyChartIsVisible == false) {
        drawChart(`DAILY STATISTICS as of ${updateTime}`, "Daily Cases", dailyCasesOverTime, "Daily Recovered", dailyRecoveredOverTime, "Daily Deaths", dailyDeathOverTime, 2, 1);
        dailyChartIsVisible = true;
    }

    casesCard.innerHTML = `<h2>Daily Cases:&nbsp;</h2><p>${todayCases}</p>`;
    recoveredCard.innerHTML = `<h2>Daily Recovered:&nbsp;</h2><p>${todayRecovered}</p>`;
    deathsCard.innerHTML = `<h2>Daily Deaths:&nbsp;</h2><p>${todayDeaths}</p>`;

    selectedButton = 'dailyButton';

    if (selectedButton == 'totalButton') { // Add 'selected' and 'hover' states to buttons
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
    document.querySelector('#numerical-stats').classList.add('full-opacity');
})




// adds array values incrementally and populates a new array
function incrementValue(array, newArray) {
    let currentValue = 0
    for(let i = 0; i < array.length; i++) {
        currentValue = array[i] + currentValue;
        newArray.push(currentValue);
    }
}

function valueOverTime (dateArray, valueArray, valueOverTimeArray) {
    for (let i=0; i<dateArray.length; i++) {
        valueOverTimeArray.push([dateArray[i], valueArray[i]]);
    }
}

//draws a chart based on the values provided
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
        name: casesText,
        data: cases
      },
      {
        name: recoveredText,
        data: recovered
      },
      {
        name: deathText,
        data: deaths
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
        width: strokeWidth,
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
  
  var chart = new ApexCharts(document.querySelector(`#chart-${chartId}`), options);
  
  chart.render();
}

window.addEventListener('load', () => {
    console.log('page has loaded')
})