'use strict';

unipaper.controller('mainLayoutController', function($scope, $mdDialog, $state, $rootScope, $mdSidenav, contentful, utilityFactory, $window, CgMailChimpService, $location, environmentVariables, $http, $timeout, cfpLoadingBar) {

  // Pre loader

  $scope.start = function() {
    cfpLoadingBar.start();
  };

  $scope.complete = function () {
    cfpLoadingBar.complete();
  }

  // fake the initial load so first time users can see it right away:

  $scope.start();
  $scope.contentarea = true;
  $timeout(function() {
    $scope.complete();
    $scope.contentarea = false;
  });

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };

  $scope.navclose = function(){
    $mdSidenav('left').close();
  };

  $scope.showSignupForm = function(event) {
    $scope.signUpNewsletterMessage = '';
    $scope.signUpNewsletter = {name: '', email: '', location: '', university: ''};
    $mdDialog.show({
      clickOutsideToClose: true,
      escapeToClose: true,
      scope: $scope,
      preserveScope: true,
      templateUrl: 'app/shared/layouts/sign-me-up-form.html',
      controller: function DialogController($scope, $mdDialog) {
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
        $scope.close = function() {
          $mdDialog.hide();
        };
      }
    });
  };

  $scope.showLocations = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      escapeToClose: true,
      templateUrl: 'app/shared/layouts/locations.html',
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

  /**
    * This function checks the current state and returns an appropriate event name to be broadcasted to trigger change
    * in city-specific content. Broadcast listeners are in the scope of the parent controller in the current state.
    */
  var getBroadcastEvent = function() {
    var broadcastEvent = '';
    switch($state.current.name) {
      case 'home':  broadcastEvent = 'changeBestOfCityContent';
                    break;
      case 'category':  broadcastEvent = 'changeCategoryContent';
                        break;
      case 'deals': broadcastEvent = 'changeDealsContent';
                    break;
      case 'wins':  broadcastEvent = 'changeWinsContent';
                    break;
      default: break;
    }
    return broadcastEvent;
  }

  /**
   * This function broadcasts an event to change city-specific content in the current state.
   */
  $scope.broadcastLocationChange = function(event) {
    var cityName = event.target.nodeName === 'SPAN' ? event.target.parentElement.getAttribute('data-value') : event.target.getAttribute('data-value');
    broadcastLocationChangeInnerAction(cityName);
  }

  /* BroadcastLocationChange action start */
  var broadcastLocationChangeInnerAction = function(cityName){
    $rootScope.currentCity = {id: utilityFactory.getCityIdFromName(cityName), name: utilityFactory.capitalizeFirstLetter(cityName)};
    utilityFactory.setCookie('selected-city', JSON.stringify($rootScope.currentCity), 7);
    var broadcastEvent = getBroadcastEvent();
    $scope.$broadcast(broadcastEvent);
  }
  /* BroadcastLocationChange action end */

  /* Home page read more action start*/
  $scope.readMore = function(url, city){
    $window.location.href = "category/"+ url +"";
    broadcastLocationChangeInnerAction(city);
  };
  /* Home page read more action start*/

  /**
    * This function fetches all cities from contentful and populates the city dropdown on resolution of contentful's promise
    */
  var fetchAllCities = function() {
    contentful
      .entries("content_type=city&order=fields.name")
      .then(function(response) {
        populateCityDropdown(response.data.items);
      });
  }

  /**
    * This function takes raw city information fetched by fetchAllCities() and populates the city dropdown
    */
  var populateCityDropdown = function(citiesRaw) {
    for(var i = 0; i < citiesRaw.length; i++) {
      var aCityRaw = citiesRaw[i];
      if(aCityRaw.fields !== undefined) {
        var aCity = {
          id: aCityRaw.sys.id,
          name: aCityRaw.fields.name.toLowerCase(),
          listId: aCityRaw.fields.userMailChimpListId !== undefined ? aCityRaw.fields.userMailChimpListId : ''
        };
        $rootScope.cities.push(aCity);
        if(aCity.name !== 'national') {
          $rootScope.mainCities.push(aCity);
        }
      }
    }
    $rootScope.currentCity = getCurrentCity(); // this scope variable is to be updated after change in location dropdown in nav bar
    broadcastInitializedEvent();
  }

  /**
    * This function broadcasts the event 'initialized'. It is called after the application enviroment is initialized
    */
  var broadcastInitializedEvent = function() {
    $scope.$broadcast('initialized');
    $rootScope.environmentInitialized = true;
  }

  /**
    * This function checks whether a city is stored in a cookie. If yes it returns that city, or defaults to London
    */
  var getCurrentCity = function() {
    var cityInCookie = utilityFactory.getCookie('selected-city');
    var currentCity = {id: utilityFactory.getCityIdFromName('London'), name: 'London'};
    if(cityInCookie !== false && cityInCookie.trim() !== '' && validateCityCookie(cityInCookie) !== false) {
      currentCity = JSON.parse(cityInCookie);
    }
    return currentCity;
  }

  /**
    * This function validates if a string has a valid city JSON
    */
  var validateCityCookie = function(cityString) {
    return checkIfStringIsJson(cityString) ? true : false; //for now we are only checking if the string has a JSON in it
  }

  /**
    * This function checks if a string has a valid JSON
    */
  var checkIfStringIsJson = function(string) {
    return /^[\],:{}\s]*$/.test(string.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) ? true : false;
  }

  /**
    * This function is the keyup listener for search boxes
    */
  var search = function(event) {
    if(event.keyCode == '13') {
      $scope.showSearch = false;
      $state.go('tag-results', {tag: $scope.search.tag});
    }
  }

  /**
    * This function highlights the selected option from the location dropdown
    */
  var highlightSelectedLocation = function() {
    for(var i = 0; i < $rootScope.cities.length; i++) {
      $scope[$rootScope.cities[i].name + 'Selected'] = undefined;
    }
    if($rootScope.currentCity.name !== undefined) {
      $scope[$rootScope.currentCity.name.toLowerCase() + 'Selected'] = true;
    }
  }

  var validateSignUpForNewsletter = function() {
    var mandatoryFields = [$scope.signUpNewsletter.name, $scope.signUpNewsletter.email, $scope.signUpNewsletter.location, $scope.signUpNewsletter.university], emailFields = [$scope.signUpNewsletter.email];
    var isMandatoryFieldsValid = utilityFactory.validateMandatoryFields(mandatoryFields) === false ? false : true;
    var isEmailFieldsValid = utilityFactory.validateEmailFields(emailFields) === false ? false : true;
    $scope.signUpNewsletterMessage = isMandatoryFieldsValid !== true ? 'Please enter into all fields. <br>' : '';
    $scope.signUpNewsletterMessage = isEmailFieldsValid !== true ? $scope.signUpNewsletterMessage + 'Please enter a valid email id.' : $scope.signUpNewsletterMessage + '';
    return isMandatoryFieldsValid && isEmailFieldsValid;
  }

  $rootScope.signMeUpForNewsletter = function() {
    if(validateSignUpForNewsletter() === true) {
      var firstAndLastNames = utilityFactory.splitNameIntoFirstAndLastNames($scope.signUpNewsletter.name);
      var signUpData = {EMAIL: $scope.signUpNewsletter.email, NAME: $scope.signUpNewsletter.name, LOCATION: $scope.signUpNewsletter.location, UNIVERSITY: $scope.signUpNewsletter.university, FNAME: firstAndLastNames !== false ? firstAndLastNames.firstName: '', LNAME: firstAndLastNames !== false ? firstAndLastNames.lastName: ''};
      var listId = utilityFactory.getCityMailListIdFromCityName($scope.signUpNewsletter.location);
      if(listId !== false) {
        CgMailChimpService.subscribe(signUpData, listId).then(function(response) {
          $scope.signUpNewsletterMessage = 'An email has been sent to your email address. Please confirm to receive our newsletter';
        }, function(response) {
          $scope.signUpNewsletterMessage = 'An error occured. Please try again later';
        });
      } else {
        $scope.signUpNewsletterMessage = 'An error occured. Please try again later';
      }
    }
  }

  $rootScope.scroll = function () {
    $window.scrollTo(0, angular.element(document.getElementById('top')).offsetTop)
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    for(var i = 0; i <= 5; i++) {
      if(document.getElementById('div-gpt-ad-1473939867799-' + i) != null) {
        document.getElementById('div-gpt-ad-1473939867799-' + i).innerHTML = '';
      }
    }
    if (fromState.name === "advertise-with-us") {
      var leadForensicsScript = document.querySelector("[src='https://secure.leadforensics.com/js/123992.js']");
      if (leadForensicsScript !== undefined) {
        leadForensicsScript.parentNode.removeChild(leadForensicsScript);
      }
    }
    $rootScope.articleMetaTags = false;
  });

  /**
    * This code tracks page views using Google analytics
    */
  $rootScope.pageViewForGoogleAnalytics = function() {
    ga('send', 'pageview', {page: $location.url()}); //ga() doesnt consider angular partial load as a page load. We need to pass 'page' explicitly
  };

  $rootScope.cities = [], $rootScope.mainCities = []; // this scope variable is to be used as a city lookup within the application
  $rootScope.environmentInitialized = false;
  $rootScope.currentCity = false;
  $rootScope.domainName = environmentVariables.domainName;
  $scope.search = {tag: ''};
  fetchAllCities();

  $scope.$on('$viewContentLoaded', function(event, viewName, viewContent) {
    if(viewName !== '@main') { //this block ensures the $viewContentLoaded event is fired only once instead of twice each time
      return false;
    }
    document.getElementById('searchBar1').addEventListener('keyup', search);
    document.getElementById('searchBar2').addEventListener('keyup', search);
    if(document.getElementById('share-txt')) { // to hide the share tooltip on content load
      document.getElementById('share-txt').style.display = "none";
      var shareSelectedInnerTextElements = document.getElementsByClassName('share-selected-text-inner');
      for(var i = 0; i < shareSelectedInnerTextElements.length; i++) {
        shareSelectedInnerTextElements[i].style.display = 'none';
      }
    }
  });

  $rootScope.$watch('currentCity', function() {
    highlightSelectedLocation();
  });
});
