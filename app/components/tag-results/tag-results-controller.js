'use strict';

unipaper.controller('tagResultsController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $stateParams, $window) {
  $rootScope.showContent = false;
  $scope.tag = $stateParams.tag;
  $scope.skip = 0;
  $scope.tagResultsContent = {verticalModule1: false, verticalModule2: false, verticalModule3: false, verticalModule4: false, verticalModule5: false, verticalModule6: false, verticalModule7: false, verticalModule8: false, verticalModule9: false, verticalModule10: false, verticalModule11: false, verticalModule12: false};
  $scope.loadMoreContent = '';
  $scope.loadMoreCount = 0;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}};
  $scope.relatedTags = [];
  $scope.noResults = false;
  var allowedContentTypes = ['article', 'listicle', 'gallery', 'writer'];
  var relatedTagsRaw = [];
  $window.prerenderReady = false;

  /**
    * This function performs a full text search across all content types using the keyword
    */
  var search = function(limit, callbackFunction) {
    contentful
      .entries("query=" + $scope.tag + "&skip=" + $scope.skip + "&limit=12")
      .then(function(response) {
        var filteredSearchResults = filterSearchResults(response.data.items);
        if(filteredSearchResults.length > 0) {
          if(response.data.total > 12 && limit === 12) {
            addLoadMoreCount(response.data.total);
          }
          if(response.data.items[0].sys.contentType.sys.id == "writer"){
            writerRequestAction(response.data.items);
          }
          else{
            callbackFunction(filteredSearchResults);
          }
        } else {
          $scope.noResults = true;
        }
        $rootScope.showContent = true;
      });

      var writerRequestAction = function(searchWriterItem){
        contentful
        .entries("content_type=article&fields.writer.sys.id=" + searchWriterItem[0].sys.id + "&limit=12")
        .then(function(response) {
          var filteredSearchResults = filterSearchResults(response.data.items);
          if(filteredSearchResults.length > 0) {
            if(response.data.total > 12 && limit === 12) {
              addLoadMoreCount(response.data.total);
            }
            callbackFunction(filteredSearchResults);
            if($scope.skip === 0) {
              $scope.skip = 12;
            } else {
              $scope.skip += 8;
            }
          } else {
            $scope.noResults = true;
          }
          $rootScope.showContent = true;
        });
      }
  }

  /**
    * This function discards results from irrelevant content types
    */
  var filterSearchResults = function(searchResultsRaw) {
    var filteredSearchResults = [];
    for(var i = 0; i < searchResultsRaw.length; i++) {
      if(allowedContentTypes.indexOf(searchResultsRaw[i].sys.contentType.sys.id) !== -1) {
        filteredSearchResults.push(searchResultsRaw[i]);
      }
    }
    fillMetaTags();
    $window.prerenderReady = true;
    return filteredSearchResults;
  }

  /**
    * This function fills tag results content modules with the filtered search results from filterSearchResults
    */
  var fillTagResultsContent = function(tagResultsRaw) {
    var count = 0;
    for(var aModule in $scope.tagResultsContent) {
      var aStory = tagResultsRaw[count];
      if(aStory !== undefined) {
        $scope.tagResultsContent[aModule] = {
          id: aStory.sys.id,
          headline: aStory.fields !== undefined ? aStory.fields.title : '',
          writerAndDate: utilityFactory.getWriterFullNameForModules(aStory),
          image: utilityFactory.getImageUrlForAStory(aStory),
          type: aStory.sys.contentType.sys.id,
          slug: aStory.fields !== undefined && aStory.fields.urlSlug !== undefined && aStory.fields.urlSlug !== '' ? aStory.fields.urlSlug : aStory.sys.id
        };
        appendTagsToRelatedTags(aStory.fields.tags !== undefined ? aStory.fields.tags : aStory.fields.tag);
      }
      count++;
    }
    fillTagsContent();
  }

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: 'Tag Result "' + $scope.tag + '" - The University Paper',
    };
  };

  var fillTagsContent = function() {
    $scope.relatedTags = relatedTagsRaw.splice(0, 5);
  }

  var appendTagsToRelatedTags = function(tags) {
    if(tags !== undefined && tags.length > 0) {
      for(var i = 0; i < tags.length; i++) {
        var aTag = utilityFactory.escapeQuotes(tags[i]);
        relatedTagsRaw.push(aTag);
      }
    }
  }

  /**
    * This function tells how many times a load more will return results.
    */
  var addLoadMoreCount = function(totalItems) {
    if(totalItems > 12) {
      var firstRemainder = totalItems - 12;
      if(firstRemainder > 8) {
        $scope.loadMoreCount = parseInt(firstRemainder / 8);
        var secondRemainder = firstRemainder % 8;
        if(secondRemainder > 0) {
          $scope.loadMoreCount++;
        }
      } else {
        $scope.loadMoreCount++;
      }
    }
  }

  /**
    * Appends content to the tag results page with the response from search()
    */
  var fillLoadMoreContent = function(tagResultsContentRaw) {
    var i, j, tagResultsContentChunk, chunkSize = 4;
    for (i = 0, j = tagResultsContentRaw.length; i < j; i += chunkSize) {
      tagResultsContentChunk = tagResultsContentRaw.slice(i, i + chunkSize);
      $scope.loadMoreContent += fillLoadMoreContentRow(tagResultsContentChunk);
    }
  }

  /**
    * Fills a row of content with a chunk of size 4 of the raw contentful data from fillLoadMoreContent(). Returns HTML as a string
    */
  var fillLoadMoreContentRow = function(tagResultsContentChunk) {
    var rowContent = '';
    for(var i = 0; i < tagResultsContentChunk.length; i++) {
      if(tagResultsContentChunk[i] !== undefined) {
        rowContent += fillVerticalModuleWithImage(tagResultsContentChunk[i]);
      }
    }
    return rowContent;
  }

  /**
    * Fills a vertical module without image with an article information. Returns HTML as a string
    */
  var fillVerticalModuleWithImage = function(anArticleRaw) {
    var anArticle = {
      id: anArticleRaw.sys.id,
      headline: anArticleRaw.fields!== undefined ? anArticleRaw.fields.title : '',
      writerAndDate: utilityFactory.getWriterFullNameForModules(anArticleRaw),
      image: utilityFactory.getImageUrlForAStory(anArticleRaw),
      type: anArticleRaw.sys.contentType.sys.id,
      slug: anArticleRaw.fields !== undefined && anArticleRaw.fields.urlSlug !== undefined && anArticleRaw.fields.urlSlug !== '' ? anArticleRaw.fields.urlSlug : anArticleRaw.sys.id
    };
    return '<div class="col-md-3 col-sm-3 col-xs-12"><div class="vertical-module with-image ' + (anArticle.image === '' ? ' module-without-image' : '') + '"><a href="/' + anArticle.type + '/' + anArticle.slug + '"><div class="headline col-xs-6 col-sm-12"><div class="headline-text ng-binding">' + anArticle.headline + '</div><div class="writer-and-date-text ng-binding">' + anArticle.writerAndDate + '</div></div><div class="article-image col-xs-6 col-sm-12"><img src=" ' + anArticle.image + '"></div></a></div></div>';
  }

  /**
    * This function triggers search() with a skip value. It is triggered on click of load more button in the view
    */
  var loadMore = function() {
    $scope.loadMoreCount--;
    search(8, fillLoadMoreContent);
  }

  /**
    * Fetches top stories for city "National"
    */
  var getTopStories = function() {
    contentful
      .entries("content_type=article&include2&limit=5&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  }

  /**
    * Fills content fetched from getTopStories() into top stories' modules
    */
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

  $scope.loadMore = function() {
    $scope.loadMoreCount--;
    search(8, fillLoadMoreContent);
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/tag-results/' + $scope.tag]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    search(12, fillTagResultsContent);
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
    search(12, fillTagResultsContent);
    getTopStories();
  }
});
