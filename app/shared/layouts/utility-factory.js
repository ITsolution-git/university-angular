'use strict';

/**
  * The Utility factory has functions to be used across the application and not pertaining to any module particularly
  */
unipaper.factory('utilityFactory', function($rootScope, environmentVariables, $http, CgMailChimpService) {

  /**
    * This function gets cookie value for the key passed as an argument
    */
  var getCookie = function(cookieKey) {
    var name = cookieKey + "=";
    var aCookie = document.cookie.split(';');
    for(var i = 0; i < aCookie.length; i++) {
      var c = aCookie[i];
      while(c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if(c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return false;
  };

  /**
    * This function sets cookie.
    */
  var setCookie = function(cookieKey, cookieValue, expiresDays) {
    document.cookie = cookieKey + "=; path=/; " + "expires=-1"; //clear any cookie of the same key
    var d = new Date();
    d.setTime(d.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieKey + "=" + cookieValue + "; path=/; " + expires;
  };

  /**
    * This function returns the city id for a city name from the city lookup
    */
  var getCityIdFromName = function(cityName) {
    cityName = cityName.toLowerCase();
    for(var i = 0; i < $rootScope.cities.length; i++) {
      if($rootScope.cities[i].name === cityName) {
        return $rootScope.cities[i].id;
      }
    }
    return false;
  };

  /**
    * This function returns the city id for a city name from the city lookup
    */
  var getCityNameFromId = function(cityId) {
    for(var i = 0; i < $rootScope.cities.length; i++) {
      if($rootScope.cities[i].id === cityId) {
        return $rootScope.cities[i].name;
      }
    }
    return false;
  };

  var getCityMailListIdFromCityName = function(cityName) {
    for(var i = 0; i < $rootScope.cities.length; i++) {
      if($rootScope.cities[i].name === cityName) {
        return $rootScope.cities[i].listId !== undefined && $rootScope.cities[i].listId !== '' ? $rootScope.cities[i].listId : false;
      }
    }
    return false;
  };

  /**
    * This function capitalizes the first letter of a string
    */
  var capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  var getContentBodyFromMarkdown = function(contentBody) {
    var contentHTML = '';
    var converter = new showdown.Converter();
    contentHTML = converter.makeHtml(contentBody);
    return contentHTML;
  };

  var checkIfEmpty = function(value) {
    if(value.trim() === '') {
      return true;
    }
    return false;
  };

  var checkIfEmailIsValid = function(emailId) {
    var validEmail = true;
    var regEx = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(regEx.test(emailId.trim()) == false) {
      validEmail = false;
    }
    return validEmail;
  };

  var validateMandatoryFields = function(fieldsArray) {
    var isValid = true;
    for(var i = 0; i < fieldsArray.length; i++) {
      var result = checkIfEmpty(fieldsArray[i]);
      if(result === true) {
        isValid = false;
      }
    }
    return isValid;
  };

  var validateEmailFields = function(fieldsArray) {
    var isValid = true;
    for(var i = 0; i < fieldsArray.length; i++) {
      var result = checkIfEmailIsValid(fieldsArray[i]);
      if(result === false) {
        isValid = false;
      }
    }
    return isValid;
  };

  var escapeQuotes = function(aString) {
    return aString.replace("'", "&apos;");
  };

  var executeAdTags = function() {
    if(window.mobilecheck() === true) {
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-4'); });
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-1'); });
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-3'); });
    } else {
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-0'); });
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-2'); });
      googletag.cmd.push(function() { googletag.display('div-gpt-ad-1473939867799-5'); });
    }
  };

  var getImageUrlForAStory = function(aStory) {
    var imageUrl = '';
    if(aStory.sys.contentType !== undefined) {
      switch(aStory.sys.contentType.sys.id) {
        case 'article' :  imageUrl = aStory.fields !== undefined && aStory.fields.articleImage !== undefined && aStory.fields.articleImage !== null && aStory.fields.articleImage.fields !== undefined ? aStory.fields.articleImage.fields.file.url : '';
                          break;
        case 'listicle' : imageUrl = aStory.fields !== undefined && aStory.fields.listicleImage !== undefined && aStory.fields.listicleImage !== null && aStory.fields.listicleImage.fields !== undefined ? aStory.fields.listicleImage.fields.file.url : '';
                          break;
        case 'gallery' :  imageUrl = aStory.fields !== undefined && aStory.fields.galleryImage !== undefined && aStory.fields.galleryImage != null && aStory.fields.galleryImage.fields !== undefined ? aStory.fields.galleryImage.fields.file.url : '';
                          break;
        case 'deals' :  imageUrl = aStory.fields !== undefined && aStory.fields.dealsImage !== undefined && aStory.fields.dealsImage != null && aStory.fields.dealsImage.fields !== undefined ? aStory.fields.dealsImage.fields.file.url : '';
                        break;
        case 'win' :  imageUrl = aStory.fields !== undefined && aStory.fields.winImage !== undefined && aStory.fields.winImage != null && aStory.fields.winImage.fields !== undefined ? aStory.fields.winImage.fields.file.url : '';
                      break;
      }
    }
    return imageUrl !== '' && imageUrl !== false && imageUrl.substr(0, 3) !== 'http' ? 'https:' + imageUrl : imageUrl;
  };


  var getWriterFullNameForModules = function(aStory) {
    var writerName = '';
    if(aStory.sys.contentType !== undefined) {
      switch(aStory.sys.contentType.sys.id) {
        case 'article' :
        case 'listicle' :
        case 'gallery' :  writerName = aStory.fields !== undefined && aStory.fields.writer !== undefined && aStory.fields.writer.fields !== undefined ? 'By ' + aStory.fields.writer.fields.name + ' ' + aStory.fields.writer.fields.lastName : '';
                          break;
      }
      return writerName;
    }
  };

  var getStoryDate = function(aStory) {
    if(aStory.fields.publishedOn !== undefined && aStory.fields.publishedOn !== '') {
      var dateString = convertDateToString(aStory.fields.publishedOn, 'publishedOn');
    } else {
      var dateString = convertDateToString(aStory.sys.createdAt, 'createdAt');
    }
    return dateString;
  };

  var convertDateToString = function(date, dateField) {
    var dateString = '';
    if(dateField === 'publishedOn') {
      var dateArray = date.substr(0, 10).split('-');
      var dateRaw = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
      dateString = (getMonthName(new Date(dateRaw).getMonth())) + ' ' + new Date(dateRaw).getFullYear();
    } else {
      var dateString = "September 2016";
    }
    return dateString;
  };

  var getMonthFromTimestamp = function(date) {
    var dateArray = date.substr(0, 10).split('-');
    var dateRaw = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
    var dateString = getMonthName(new Date(dateRaw).getMonth());
    return dateString;
  };

  var getMonthName = function(month) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month] !== undefined ? monthNames[month] : '';
  };

  var splitNameIntoFirstAndLastNames = function(name) {
    if(name !== undefined && name.trim() !== '') {
      var splitName = name.split(' ');
      var firstName = splitName[0];
      var lastName = ' ';
      if(splitName.length > 1) {
        for(var i = 1; i < splitName.length; i++) {
          lastName += splitName[i] + ' ';
        }
      }
      return {firstName: firstName, lastName: lastName};
    }
    return false;
  };

  return {
    getCookie: getCookie,
    setCookie: setCookie,
    getCityIdFromName: getCityIdFromName,
    capitalizeFirstLetter: capitalizeFirstLetter,
    getContentBodyFromMarkdown: getContentBodyFromMarkdown,
    validateMandatoryFields: validateMandatoryFields,
    validateEmailFields: validateEmailFields,
    escapeQuotes: escapeQuotes,
    getCityNameFromId: getCityNameFromId,
    executeAdTags: executeAdTags,
    getImageUrlForAStory: getImageUrlForAStory,
    getStoryDate: getStoryDate,
    getMonthFromTimestamp: getMonthFromTimestamp,
    getMonthName: getMonthName,
    convertDateToString: convertDateToString,
    getCityMailListIdFromCityName: getCityMailListIdFromCityName,
    getWriterFullNameForModules: getWriterFullNameForModules,
    splitNameIntoFirstAndLastNames: splitNameIntoFirstAndLastNames
  };
})
