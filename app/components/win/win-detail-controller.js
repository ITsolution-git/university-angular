'use strict';

unipaper.controller('winDetailController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $stateParams, $http, CgMailChimpService, $window) {
  $rootScope.showContent = false;
  $scope.winContent = {};
  $scope.moreWinsContent = {horizontalModule1: {}, horizontalModule2: {}};
  $scope.relatedStoriesContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}};
  $scope.signup = {name: '', email: '', location: '', university: ''};
  $window.prerenderReady = false;

  var getWin = function() {
    contentful
      .entries("content_type=win&sys.id=" + $stateParams.id)
      .then(function(response) {
        fillWinContent(response.data.items[0]);
      });
  };

  var fillWinContent = function(winRaw) {
    $scope.winContent = {
      id: winRaw.sys.id,
      headline: winRaw.fields !== undefined ? winRaw.fields.title : '',
      subHeading: winRaw.fields !== undefined && winRaw.fields.subHeading !== undefined ? winRaw.fields.subHeading : '',
      image: utilityFactory.getImageUrlForAStory(winRaw),
      content: utilityFactory.getContentBodyFromMarkdown(winRaw.fields.contentBody),
      listId: winRaw.fields !== undefined ? winRaw.fields.mailchimpListId : '',
      terms: winRaw.fields !== undefined && winRaw.fields.termsConditions !== undefined ? utilityFactory.getContentBodyFromMarkdown(winRaw.fields.termsConditions) : ''
    };
    fillMetaTags();
    $window.prerenderReady = true;
    if(winRaw.fields.moreWin !== undefined) {
      fillMoreWinsContent(winRaw.fields.moreWin);
    }
    if(winRaw.fields.relatedStories !== undefined) {
      fillRelatedStoriesContent(winRaw.fields.relatedStories);
    }
  };

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: $scope.winContent.headline + " ",
      ogUrl: environmentVariables.domainName + '/competitions/' + $scope.winContent.id,
      ogImage: $scope.winContent.image,
      description: $scope.winContent.headline + $scope.winContent.subHeading
    };
  };

  var fillMoreWinsContent = function(moreWinsRaw) {
    var count = 0;
    if(moreWinsRaw.length > 0) {
      for(var aModule in $scope.moreWinsContent) {
        var aWin = moreWinsRaw[count];
        if(aWin !== undefined && aWin.fields !== undefined) {
          $scope.moreWinsContent[aModule] = {
            id: aWin.sys.id,
            headline: aWin.fields.title,
            date: 'Available until ' + (aWin.fields !== undefined && aWin.fields.dealEndTime !== undefined ? utilityFactory.getMonthFromTimestamp(aWin.fields.dealEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
            image: utilityFactory.getImageUrlForAStory(aWin)
          };
        }
        count++;
      }
    }
  };

  var fillRelatedStoriesContent = function(relatedStoriesRaw) {
    var count = 0;
    if(relatedStoriesRaw.length > 0) {
      $scope.relatedStoriesContent = {horizontalModuleWithoutImage1: {}, horizontalModule1: {}, horizontalModuleWithoutImage2: {}, horizontalModule2: {}};
      for(var aModule in $scope.relatedStoriesContent) {
        var aStory = relatedStoriesRaw[count];
        if(aStory !== undefined && aStory.fields !== undefined) {
          $scope.relatedStoriesContent[aModule] = {
            id: aStory.sys.id,
            headline: aStory.fields !== undefined ? aStory.fields.title : '',
            writerAndDate: utilityFactory.getWriterFullNameForModules(aStory),
            image: utilityFactory.getImageUrlForAStory(aStory),
            type: aStory.sys.contentType.sys.id,
            slug: aStory.fields !== undefined && aStory.fields.urlSlug !== undefined && aStory.fields.urlSlug !== '' ? aStory.fields.urlSlug : aStory.sys.id
          };
        }
        count++;
      }
    }
  };

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=8&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  };

  var fillTopStoriesContent = function(topStoriesContentRaw) {
    var count = 0;
    for(var aModule in $scope.topStoriesContent) {
      var anArticle = topStoriesContentRaw[count];
      if(anArticle !== undefined && anArticle.fields !== undefined) {
        $scope.topStoriesContent[aModule] = {
          id: anArticle.sys.id,
          headline: anArticle.fields !== undefined ? anArticle.fields.title : '',
          writerAndDate: utilityFactory.getWriterFullNameForModules(anArticle),
          image: utilityFactory.getImageUrlForAStory(anArticle),
          type: anArticle.sys.contentType.sys.id,
          slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id
        };
      }
      count++;
    }
    $rootScope.showContent = true;
  };

  var validateSignUpForWin = function() {
    var mandatoryFields = [$scope.signup.name, $scope.signup.email, $scope.signup.location, $scope.signup.university], emailFields = [$scope.signup.email];
    var isMandatoryFieldsValid = utilityFactory.validateMandatoryFields(mandatoryFields) === false ? false : true;
    var isEmailFieldsValid = utilityFactory.validateEmailFields(emailFields) === false ? false : true;
    $scope.signUpMessage = isMandatoryFieldsValid !== true ? 'Please enter into all fields. <br>' : '';
    $scope.signUpMessage = isEmailFieldsValid !== true ? $scope.signUpMessage + 'Please enter a valid email id.' : $scope.signUpMessage + '';
    return isMandatoryFieldsValid && isEmailFieldsValid;
  };

  $scope.signUpForWin = function() {
    if(validateSignUpForWin() === true) {
      var firstAndLastNames = utilityFactory.splitNameIntoFirstAndLastNames($scope.signup.name);
      var signUpData = {EMAIL: $scope.signup.email, NAME: $scope.signup.name, LOCATION: $scope.signup.location, UNIVERSITY: $scope.signup.university, FNAME: firstAndLastNames !== false ? firstAndLastNames.firstName: '', LNAME: firstAndLastNames !== false ? firstAndLastNames.lastName: ''};
      var listId = $scope.winContent.listId;
      if(listId !== undefined && listId !== '') {
        CgMailChimpService.subscribe(signUpData, listId).then(function(response) {
          $scope.signUpMessage = 'An email has been sent to your email address. Please confirm to receive updates for this competition';
        }, function(response) {
          $scope.signUpMessage = 'An error occured. Please try again later';
        });
      } else {
        $scope.signUpMessage = 'An error occured. Please try again later';
      }
    }
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/competitions/' + $stateParams.id]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getWin();
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
    getWin();
    getTopStories();
  }
});
