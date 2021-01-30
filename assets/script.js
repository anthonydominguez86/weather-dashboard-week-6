$(document).ready(function () {
  //search button feature
  $("#search-button").on("click", function () {
    //get value in input search-value.
    var searchTerm = $("#search-value").val();
    //empty input field.
    $("#search-value").val("");
    weatherFunction(searchTerm);
    weatherForecast(searchTerm);
  });

  //search button enter key feature. 
  $("#search-button").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
      weatherFunction(searchTerm);
      weatherForecast(searchTerm);
    }
  });

  //pull previous searches from local storage
  var history = JSON.parse(localStorage.getItem("history")) || [];

  //sets history array search to correct length
  if (history.length > 0) {
    weatherFunction(history[history.length - 1]);
  }
  //makes a row for each element in history array(searchTerms)
  for (var i = 0; i < history.length; i++) {
    createRow(history[i]);
  }

  //puts the searched cities underneath the previous searched city 
  function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item").text(text);
    $(".history").append(listItem);
  }

  //listener for list item on click function
  $(".history").on("click", "li", function () {
    weatherFunction($(this).text());
    weatherForecast($(this).text());
  });

  function weatherFunction(searchTerm) {

    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=9f112416334ce37769e5c8683b218a0d",


    }).then(function (data) {
      //if index of search value does not exist
      if (history.indexOf(searchTerm) === -1) {
        //push searchValue to history array
        history.push(searchTerm);
        //places item pushed into local storage
        localStorage.setItem("history", JSON.stringify(history));
        createRow(searchTerm);
      }
      // clears out old content
      $("#today").empty();

      var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
      var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " K");
      console.log(data)
      var lon = data.coord.lon;
      var lat = data.coord.lat;

      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=9f112416334ce37769e5c8683b218a0d&lat=" + lat + "&lon=" + lon,


      }).then(function (response) {
        console.log(response);

        var uvColor;
        var uvResponse = response.value;
        var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);


        if (uvResponse < 3) {
          btn.addClass("btn-success");
        } else if (uvResponse < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        cardBody.append(uvIndex);
        $("#today .card-body").append(uvIndex.append(btn));

      });

      // merge and add to page
      title.append(img);
      cardBody.append(title, temp, humid, wind);
      card.append(cardBody);
      $("#today").append(card);
      console.log(data);
    });
  }
  // function weatherForecast(searchTerm) 
  function weatherForecast(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=9f112416334ce37769e5c8683b218a0d&units=imperial",

    }).then(function (data) {
      console.log(data);
      $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

      //loop to create a new card for 5 days pull data image from search
      for (var i = 0; i < data.list.length; i++) {

        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

          var titleFive = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
          var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
          var colFive = $("<div>").addClass("col-md-2.5");
          var cardFive = $("<div>").addClass("card bg-primary text-white");
          var cardBodyFive = $("<div>").addClass("card-body p-2");
          var humidFive = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
          var tempFive = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");

          //merge together and put on page
          colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, humidFive)));
          //append card to column, body to card, and other elements to body
          $("#forecast .row").append(colFive);
        }
      }
    });
  }

});