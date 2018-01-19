'use strict';

unipaper.controller('dealsController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $window) {
  $rootScope.showContent = false;
  $scope.dealsContent = false;
  $scope.relatedStoriesContent = false;
  $scope.loadMoreContent = '';
  $scope.loadMoreCount = 0;
  $scope.skip = 0;
  var relatedTagsRaw = [];
  var relatedStoriesRaw = [];
  $scope.relatedTags = [];
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {},horizontalModule7: {}, horizontalModule8: {}};
  $scope.showDealsContent = false;
  $window.prerenderReady = false;

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
  };

  /**
    * This function gets deals for a city
    */
  var getDealsContent = function() {
    contentful
      .entries("content_type=deals&fields.city.sys.id=" + $rootScope.currentCity.id + "&order=-fields.boost&include=3")
      .then(function(response) {
        $scope.dealsContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}, horizontalModule9: {}, horizontalModule10: {} }
        fillDealsContent(response.data.items);
        $scope.showDealsContent = true;
        getSkipCount();
        getLoadmoreButton(response.data.total);
      });
      $rootScope.showContent = true;
  };

  var fillRelatedTagsAndStoriesContent = function() {
    fillRelatedTagsContent();
    fillRelatedStoriesContent();
  };

  /**
    * Fills related tags content after processing raw information
    */
  var fillRelatedTagsContent = function() {
    $scope.relatedTags = relatedTagsRaw.splice(0, 5);
  };

  /**
    * Fills related stories content after processing raw information
    */
  var fillRelatedStoriesContent = function() {
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
            imageDescription: aStory.fields !== undefined && aStory.fields.articleImageDes !== undefined && aStory.fields.articleImageDes !== "" ? aStory.fields.articleImageDes : aStory.fields.title,
            type: aStory.sys.contentType.sys.id,
            slug: aStory.fields !== undefined && aStory.fields.urlSlug !== undefined && aStory.fields.urlSlug !== '' ? aStory.fields.urlSlug : aStory.sys.id
          };
        }
        count++;
      }
    }
  };

  /**
    * This function fills the deals content with response from getDealsContent
    */
  var fillDealsContent = function(dealsContentRaw) {
    var count = 0;
    for(var aModule in $scope.dealsContent) {
      var aDeal = dealsContentRaw[count];
      if(aDeal !== undefined) {
        $scope.dealsContent[aModule] = {
          id: aDeal.sys.id,
          headline: aDeal.fields !== undefined && aDeal.fields.title !== undefined ? aDeal.fields.title : '',
          date: 'Available until ' + (aDeal.fields !== undefined && aDeal.fields.dealEndTime !== undefined ? utilityFactory.getMonthFromTimestamp(aDeal.fields.dealEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
          image: utilityFactory.getImageUrlForAStory(aDeal)
        };
        appendToTagsAndRelatedStoriesLookup(aDeal);
      }
      count++;
    }
    fillRelatedTagsAndStoriesContent();
    fillMetaTags();
    $window.prerenderReady = true;
  };

  /**
    * Fill meta tags with page-relevant content
    */

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: "Deals - The University Paper",
      description: "Find the best Deals across the UK."
    };
  };

  /**
    * This function creates a lookup of all related tags and stories as local variables
    */
  var appendToTagsAndRelatedStoriesLookup = function(anArticle) {
    if(anArticle.fields.relatedStories !== undefined && anArticle.fields.relatedStories.length > 0) {
      for(var i =0; i < anArticle.fields.relatedStories.length; i++) {
        relatedStoriesRaw.push(anArticle.fields.relatedStories[i]);
      }
    }
    if(anArticle.fields.tags !== undefined && anArticle.fields.tags.length > 0) {
      for(var i = 0; i < anArticle.fields.tags.length; i++) {
        var aTag = utilityFactory.escapeQuotes(anArticle.fields.tags[i]);
        relatedTagsRaw.push(aTag);
      }
    }
  };

  /* Load more click action start */
  $scope.loadMore = function(){
    getLoadDealContent(10, fillLoadMoreContent);
  };

  var getLoadDealContent = function(limit, callbackFunction) {
    contentful
    .entries("content_type=deals&skip=" + $scope.skip + "&limit=" + limit + "&fields.city.sys.id=" + $rootScope.currentCity.id + "&order=-fields.boost&include=3")
    .then(function(response) {
      callbackFunction(response.data.items);
      getSkipCount();
      if(response.data.total > 10 && limit === 10) {
        getLoadmoreButton(response.data.total);
      }
    });
  };

  var getSkipCount = function(){
    if($scope.skip === 0) {
      $rootScope.showContent = true;
      $scope.skip = 10;
    } else {
      $scope.skip += 10;
    }
  };

  var getLoadmoreButton = function(totalDeal){
    if(totalDeal < $scope.skip || totalDeal === $scope.skip || totalDeal <= 10 || !totalDeal){
      $scope.loadMoreCount = 1;
    }
  };

  var fillLoadMoreContent = function(dealContentRaw) {
    for(var i = 0; i < dealContentRaw.length; i++) {
      $scope.loadMoreContent += fillVerticalModuleWithImage(dealContentRaw[i]);
    }
  };

  var fillVerticalModuleWithImage = function(anDealItem) {
    var anDeal = {
      id: anDealItem.sys.id,
      headline: anDealItem.fields !== undefined ? anDealItem.fields.title : '',
      date: 'Available until ' + (anDealItem.fields !== undefined && anDealItem.fields.dealEndTime !== undefined ? utilityFactory.getMonthFromTimestamp(anDealItem.fields.dealEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
      image: utilityFactory.getImageUrlForAStory(anDealItem)
    };
    var openDealLink = environmentVariables.domainName + "/deal/" + anDeal.id;
    return '<div class="horz-block-item image-module ' + (anDeal.image === '' ? "module-without-image" : '') + '" ng-if="' + anDeal.id + ' && showDealsContent"><div class="row"><div class="col-md-6 col-sm-6 col-xs-12"><div class="horz-block-item-cont"><p>' + anDeal.headline + '</p><small>' + anDeal.date + '</small><a href="' + openDealLink + '" class="btn btn-border md-button ng-scope md-ink-ripple">Open Deal</a></div></div><div class="col-md-6 col-sm-6 col-xs-12"><img src="' + anDeal.image + '"alt=""class="object-fit-cover"></div></div></div>';
  };
  /* Load more click action end */

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/deals']);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getDealsContent();
    getTopStories();
  });

  /**
    * The broadcast listener for the event 'changeDealsContent'. The event is broadcasted on change of location dropdown in the nav bar
    */
  $scope.$on('changeDealsContent', function(event, args) {
    $scope.showDealsContent = false;
    getDealsContent();
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
    getDealsContent();
    getTopStories();
  }
});
