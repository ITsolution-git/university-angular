'use strict';

unipaper.controller('winsController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $window) {
  $rootScope.showContent = false;
  $scope.showWinContent = false
  $scope.winsContent = false;
  $scope.relatedStoriesContent = false;
  $scope.loadMoreContent = '';
  $scope.loadMoreCount = 0;
  $scope.skip = 0;
  var relatedTagsRaw = [];
  var relatedStoriesRaw = [];
  $scope.relatedTags = [];
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}};
  $window.prerenderReady = false;

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=8&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  }

  var fillTopStoriesContent = function(topStoriesContentRaw) {
    var count = 0;
    for(var aModule in $scope.topStoriesContent) {
      var anArticle = topStoriesContentRaw[count];
      if(anArticle !== undefined) {
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
  }

  /**
    * This function gets wins for a city
    */
  var getWinsContent = function() {
    contentful
      .entries("content_type=win&fields.city.sys.id=" + $rootScope.currentCity.id + "&order=-fields.boost&include=3")
      .then(function(response) {
        $scope.winsContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {},horizontalModule9: {}, horizontalModule10: {}};
        fillWinsContent(response.data.items);
        $scope.showWinContent = true;
        getSkipCount();
        getLoadmoreButton(response.data.total);
      });
      fillMetaTags();
      $window.prerenderReady = true;
  }

  /**
    * Fill meta tags with page-relevant content
    */

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: "Competitions - The University Paper",
      description: "Visit to win freebies"
    };
  };

  /**
    * This function fills the wins content with response from getWinsContent
    */
  var fillWinsContent = function(winsContentRaw) {
    var count = 0;
    for(var aModule in $scope.winsContent) {
      var aWin = winsContentRaw[count];
      if(aWin !== undefined) {
        $scope.winsContent[aModule] = {
          id: aWin.sys.id,
          headline: aWin.fields !== undefined ? aWin.fields.title : '',
          date: 'Available until ' + (aWin.fields !== undefined && aWin.fields.winEndTime ? utilityFactory.getMonthFromTimestamp(aWin.fields.winEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
          image: utilityFactory.getImageUrlForAStory(aWin)
        };
        appendToTagsAndRelatedStoriesLookup(aWin);
      }
      count++;
    }
    fillRelatedTagsAndStoriesContent();
    $rootScope.showContent = true;
  }

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
  }

  var fillRelatedTagsAndStoriesContent = function() {
    fillRelatedTagsContent();
    fillRelatedStoriesContent();
  }

  /**
    * Fills related tags content after processing raw information
    */
  var fillRelatedTagsContent = function() {
    $scope.relatedTags = relatedTagsRaw.splice(0, 5);
  }

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
            type: aStory.sys.contentType.sys.id,
            slug: aStory.fields !== undefined && aStory.fields.urlSlug !== undefined && aStory.fields.urlSlug !== '' ? aStory.fields.urlSlug : aStory.sys.id
          };
        }
        count++;
      }
    }
  }

  /* Load more click action start */
  $scope.loadMore = function(){
    getLoadWinContent(10, fillLoadMoreContent);
  }
  var getLoadWinContent = function(limit, callbackFunction) {
    contentful
    .entries("content_type=win&skip=" + $scope.skip + "&limit=" + limit + "&fields.city.sys.id=" + $rootScope.currentCity.id + "&order=-fields.boost&include=3")
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
  var getLoadmoreButton = function(totalWin){
    if(totalWin < $scope.skip || totalWin === $scope.skip || totalWin <= 10 || !totalWin){
      $scope.loadMoreCount = 1;
    }
  };
  var fillLoadMoreContent = function(winContentRaw) {
    for(var i = 0; i < winContentRaw.length; i++) {
      $scope.loadMoreContent += fillVerticalModuleWithImage(winContentRaw[i]);
    }
  };
  var fillVerticalModuleWithImage = function(anWinItem) {
    var anWin = {
      id: anWinItem.sys.id,
      headline: anWinItem.fields !== undefined ? anWinItem.fields.title : '',
      date: 'Available until ' + (anWinItem.fields !== undefined && anWinItem.fields.winEndTime !== undefined ? utilityFactory.getMonthFromTimestamp(anWinItem.fields.winEndTime) : utilityFactory.getMonthName(((new Date()).getMonth()))),
      image: utilityFactory.getImageUrlForAStory(anWinItem)
    };
    var openWinLink =  environmentVariables.domainName + "/competitions/" + anWin.id;
    return '<div class="horz-block-item image-module ' + (anWin.image === '' ? "module-without-image" : '') + '" ng-if="' + anWin.id + ' && showWinContent"><div class="row"><div class="col-md-6 col-sm-6 col-xs-12"><div class="horz-block-item-cont"><p>' + anWin.headline + '</p><small>' + anWin.date + '</small><a href="' + openWinLink + '" class="btn btn-border md-button ng-scope md-ink-ripple">Enter</a></div></div><div class="col-md-6 col-sm-6 col-xs-12"><img src="' + anWin.image + '"alt=""class="object-fit-cover"></div></div></div>';
  };

  /* Load more click action end */

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/competitions']);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getWinsContent();
    getTopStories();
  });

  /**
    * The broadcast listener for the event 'changeWinsContent'. The event is broadcasted on change of location dropdown in the nav bar
    */
  $scope.$on('changeWinsContent', function(event, args) {
    $scope.showWinContent = false;
    getWinsContent();
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
    getWinsContent();
    getTopStories();
  }
});
