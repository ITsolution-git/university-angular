'use strict';

unipaper.controller('thePaperController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $mdDialog, $window) {
  $rootScope.showContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}};
  $scope.selectedCity = '', $scope.monthAndYear = '';
  $scope.paperError = false;
  $scope.monthLookup = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $scope.monthDropdownOptions = $scope.currentMonthAndYear = $window.prerenderReady = false;

  /**
    * Fills month dropdown with options dynamically
    */
  var fillMonthDropdownOptions = function() {
    var currentMonthAndYear = getCurrentMonthAndYear(), year = 2016, i, options = ['October 2015', 'November 2015', 'December 2015', 'January 2016', 'February 2016', 'March 2016', 'April 2016', 'May 2016'];
    currentMonthAndYear = { month: "September", year: 2017 }; //locking the month and year at Sept 2017 for UN-672
    var excludedMonths = ['June 2017', 'July 2017', 'August 2017'];
    while(year <= currentMonthAndYear.year) {
      i = year === 2016 ? 9 : 0; //start month from October 2016 since we dont have entries for months before it
      for(i; i < 12; i++) {
        var monthAndYear = $scope.monthLookup[i] + ' ' + year;
        if(excludedMonths.indexOf(monthAndYear) === -1) {
          options.push(monthAndYear);
        }
        if(currentMonthAndYear.month === $scope.monthLookup[i]) {
          break;
        }
      }
      year++;
    }
    $scope.monthDropdownOptions = options.reverse();
    var currentMonthAndYearString = currentMonthAndYear.month + ' ' + currentMonthAndYear.year;
    $scope.currentMonthAndYear = $scope.monthAndYear = excludedMonths.indexOf(currentMonthAndYearString) === -1 ? currentMonthAndYearString : options[0]; //UN-612
    getPaperContent($scope.currentMonthAndYear);
  };

  /**
    * Returns an object with current month and year as name value pairs
    */
  var getCurrentMonthAndYear = function() {
    var date = new Date();
    return {month: $scope.monthLookup[date.getMonth()], year: date.getFullYear()};
  };

  /**
    * Opens the years dropdown dialog
    */
  $scope.showYears = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      escapeToClose: true,
      templateUrl: 'app/components/the-paper/years.html',
      controller: function DialogController($scope, $mdDialog) {
        highlightSelectedMonth();
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
        $scope.close = function() {
          $mdDialog.hide();
        };
      }
    });
  };

  $scope.showLocationsDropdown = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      escapeToClose: true,
      templateUrl: 'app/components/the-paper/locations.html',
      controller: function DialogController($scope, $mdDialog) {
        highlightSelectedLocation();
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
        $scope.close = function() {
          $mdDialog.hide();
        };
      }
    });
    $window.scrollTo(0,0);
  };

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=5&order=-fields.boost&fields.city.sys.id" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  }

  var fillTopStoriesContent = function(topStoriesContentRaw) {
    var count = 0;
    for(var aModule in $scope.topStoriesContent) {
      var anArticle = topStoriesContentRaw[count];
      if(anArticle === undefined) continue;
      $scope.topStoriesContent[aModule] = {
        id: anArticle.sys.id,
        headline: anArticle.fields !== undefined ? anArticle.fields.title : '',
        writerAndDate: utilityFactory.getWriterFullNameForModules(anArticle),
        image: utilityFactory.getImageUrlForAStory(anArticle),
        imageDescription: anArticle.fields !== undefined && anArticle.fields.articleImageDes !== undefined && anArticle.fields.articleImageDes !== "" ? anArticle.fields.articleImageDes : anArticle.fields.title,
        type: anArticle.sys.contentType.sys.id,
        slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id
      };
      count++;
    }
    $rootScope.showContent = true;
  }

  var getPaperContent = function() {
    var queryString = "include=4&content_type=thePaper&fields.editionMonthYear=" + $scope.monthAndYear;
    if($scope.selectedCity !== '') {
      queryString += "&fields.city.sys.id=" + $scope.selectedCity.id;
    }
    contentful
      .entries(queryString)
      .then(function(response) {
        $scope.monthYear = $scope.monthAndYear;
        $scope.paperError = false;
        if(response.data.items.length > 0) {
          fillPaperContent(response.data.items);
        } else {
          $scope.paperError = true;
        }
      });
      fillMetaTags();
      $window.prerenderReady = true;
  }

  var fillPaperContent = function(paperContentRaw) {
    $scope.paperContent = [];
    for(var i = 0; i < paperContentRaw.length; i++) {
      var aPaper = paperContentRaw[i];
      $scope.paperContent[i] = {
        url: aPaper.fields.eReaderUrl !== undefined ? aPaper.fields.eReaderUrl : '',
        image: aPaper.fields.thumbnailUrl !== undefined ? aPaper.fields.thumbnailUrl : '',
        city: aPaper.fields.city[0].sys !== undefined ? utilityFactory.getCityNameFromId(aPaper.fields.city[0].sys.id) : ''
      };
    }
  }

  /**
    * Fill meta tags with page-relevant content
    */

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: "Archives - The University Paper",
      description: "Visit The University Paper Archives section for all the news, features, sports, what's on and celebrity interviews for students across the UK over last few years."
    };
  };

  /**
    * Highlights selected location after dropdown change
    */
  var highlightSelectedLocation = function() {
    $scope.allCitiesSelectedForThePaper = undefined;
    for(var i = 0; i < $rootScope.cities.length; i++) {
      $scope[$rootScope.cities[i].name + 'SelectedForThePaper'] = undefined;
    }
    if($scope.selectedCity === '') {
      $scope.allCitiesSelectedForThePaper = true;
    }
    if($scope.selectedCity.name !== undefined) {
      $scope[$scope.selectedCity.name.toLowerCase() + 'SelectedForThePaper'] = true;
    }
  }

  /**
    * Highlights selected month after dropdown change
    */
  var highlightSelectedMonth = function() {
    for(var i = 0; i < $scope.monthDropdownOptions.length; i++) {
      $scope[$scope.monthDropdownOptions[i].replace(' ', '') + 'SelectedForThePaper'] = undefined;
    }
    if($scope.monthAndYear !== '') {
      $scope[$scope.monthAndYear.replace(' ', '') + 'SelectedForThePaper'] = true;
    }
  }

  /**
    * This function is called when user selects a city from the city dropdown to reset content
    */
  $scope.changeCity = function(event) {
    var cityName = event.target.nodeName === 'SPAN' ? event.target.parentElement.getAttribute('data-value') : event.target.getAttribute('data-value');
    if(cityName !== 'all') {
      $scope.selectedCity = {id: utilityFactory.getCityIdFromName(cityName), name: utilityFactory.capitalizeFirstLetter(cityName)};
    } else {
      $scope.selectedCity = '';
    }
    highlightSelectedLocation();
    getPaperContent();
  }

  /**
    * This function is called when user changes a month from the month dropdown to reset content
    */
  $scope.changeMonthAndYear = function(event) {
    $scope.monthAndYear = event.target.nodeName === 'SPAN' ? event.target.parentElement.getAttribute('data-value') : event.target.getAttribute('data-value');
    getPaperContent();
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/the-paper']);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    fillMonthDropdownOptions();
    getTopStories();
  });

  /**
    * For functions that require the partial's content to be loaded
    */
  $scope.$on('$viewContentLoaded', function(event) {
    utilityFactory.executeAdTags();
    $rootScope.pageViewForGoogleAnalytics();
  });

  /**
    * This block checks if the environment is already initialized when the partial loads. If not nothing happens
    * and the view waits for the 'initialized' event to be broadcasted
    */
  if($rootScope.environmentInitialized === true) {
    fillMonthDropdownOptions();
    getTopStories();
  }
});
