/* Tab Handling Section here we will control which tab to be shown whether your weather tab or teh search tab. */
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm ]");
const searchInp = document.querySelector("[data-searchInp]");
const apiErrorContainer = document.querySelector(".api-error-container");

let currentTab = userTab;

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

/*Setting the default Tab as UserTab->which will show the weather according to your live location. */
currentTab.classList.add("current-tab");

/*Setting the default Tab as UserTab->which will show the weather according to your live location. */
function switchTab(clickedTab) {
  apiErrorContainer.classList.remove("active");
  /*Here checking if the clicked tab and current tab are same then do nothing and if they are different then follow these conditions. */
  if (clickedTab !== currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");
    /*If our searchForm classlist doesn't contains any active class then this means that it is clicked and we have to add an active class in it. */
    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      getFromSessionStorage(); //This function is too store the local co-ordinates of your location.
    }
  }
}

/* Adding event listener which will call a callBackFunction switchTab which will have different tabs. */
userTab.addEventListener("click", () => {
  switchTab(userTab);
});
searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

/* User Weather Handling. */
const grantAccessBtn = document.querySelector("[data-grantAccess]");
const messageText = document.querySelector("[data-messageText]");
const loadingScreen = document.querySelector(".loading-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");

/* Check id we already have co-ordinates in session storage or not if he is checking it second time. */
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

/* If we already don't have any coordinates in Session storage then we have to find out the current location of the user.
We can get the Coordinates using geoLocation method. */
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    grantAccessBtn.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser.";
  }
}

/* If we have clicked the grant access button than we have to store users coordinates in the session storage. */
function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

/* Handling the Error if geolocation feature is not available in the your Browser. 
Whereas if we have entered a wrong city name in serach tab then too we have to throw the error. */
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}

// If we already have a stored coordinates.
getFromSessionStorage();

/*Here we are adding a event listener on the grant access button to find out the location of your current location or coordinates. */
grantAccessBtn.addEventListener("click", getLocation);

// Fetch data from API -> user weather info
async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  /* When we are fetching the data it that case we have to remove the current tab and start a loding screen. */
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    if (!data.sys) {
      throw data;
    }

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    //Once we have Extracted our data then the next step is too render this data.
    renderWeatherInfo(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

/* Rending the Weather Info in the UI. */
function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

   /*Here we are going to use operational chaninig.(?.) */
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.main;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

/* Search Weather Tab Handling. */
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInp.value === "") return;
  fetchSearchWeatherInfo(searchInp.value);
  searchInp.value = "";
});

/*Fetch data form API -> Search Weather Info. */
async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  apiErrorContainer.classList.remove("active");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    // console.log("Search - Api Fetch Data", data);
    if (!data.sys) {
      throw data;
    }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    // console.log("Search - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `${error?.message}`;
    apiErrorBtn.style.display = "none";
  }
}
