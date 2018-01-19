'use strict';

unipaper.controller('dealDetailController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $stateParams, $window) {
  $rootScope.showContent = false;
  $scope.dealContent = {};
  $scope.moreDealsContent = {horizontalModule1: {}, horizontalModule2: {}};
  $scope.relatedStoriesContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}};
  $window.prerenderReady = false;

  var getDeal = function() {
    contentful
      .entries("content_type=deals&sys.id=" + $stateParams.id)
      .then(function(response) {
        fillDealContent(response.data.items[0]);
      });
  };

  var fillDealContent = function(dealRaw) {
    $scope.dealContent = {
      id: dealRaw.sys.id,
      headline: dealRaw.fields !== undefined ? dealRaw.fields.title : '',
      subHeading: dealRaw.fields !== undefined && dealRaw.fields.subHeading !== undefined ? dealRaw.fields.subHeading : '',
      image: utilityFactory.getImageUrlForAStory(dealRaw),
      content: utilityFactory.getContentBodyFromMarkdown(dealRaw.fields.contentBody)
    };
    fillMetaTags();
    $window.prerenderReady = true;
    if(dealRaw.fields.moreDeals !== undefined) {
      fillMoreDealsContent(dealRaw.fields.moreDeals);
    }
    if(dealRaw.fields.relatedStories !== undefined) {
      fillRelatedStoriesContent(dealRaw.fields.relatedStories);
    }
  };

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: $scope.dealContent.headline + " ",
      ogUrl: environmentVariables.domainName + '/deal/' + $scope.dealContent.id,
      ogImage: $scope.dealContent.image,
      description: $scope.dealContent.headline + $scope.dealContent.subHeading
    };
  };

  var fillMoreDealsContent = function(moreDealsRaw) {
    var count = 0;
    for(var aModule in $scope.moreDealsContent) {
      var aDeal = moreDealsRaw[count];
      if(aDeal !== undefined) {
        $scope.moreDealsContent[aModule] = {
          id: aDeal.sys.id,
          headline: aDeal.fields !== undefined ? aDeal.fields.title : '',
          date: 'Available until ' + (aDeal.fields !== undefined && aDeal.fields.dealEndTime !== undefined ? utilityFactory.getMonthFromTimestamp(aDeal.fields.dealEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
          image: utilityFactory.getImageUrlForAStory(aDeal)
        };
      }
      count++;
    }
  };

  var fillRelatedStoriesContent = function(relatedStoriesRaw) {
    var count = 0;
    if(relatedStoriesRaw.length > 0) {
      $scope.relatedStoriesContent = {horizontalModuleWithoutImage1: {}, horizontalModule1: {}, horizontalModuleWithoutImage2: {}, horizontalModule2: {}}
      for(var aModule in $scope.relatedStoriesContent) {
        var aStory = relatedStoriesRaw[count];
        if(aStory !== undefined && aStory.fields !== undefined) {
          $scope.relatedStoriesContent[aModule] = {
            id: aStory.sys.id,
            headline: aStory.fields !== undefined ? aStory.fields.title : '',
            writerAndDate: utilityFactory.getWriterFullNameForModules(aStory),
            image: utilityFactory.getImageUrlForAStory(aStory),
            imageDescription: aStory.fields !== undefined && aStory.fields.articleImageDes !== undefined && aStory.fields.articleImageDes !== "" ? aStory.fields.articleImageDes : aStory.fields.title,
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
  };

  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/deal/' + $stateParams.id]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getDeal();
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
    getDeal();
    getTopStories();
  }
});
