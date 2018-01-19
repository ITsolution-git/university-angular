'use strict';

unipaper.controller('profileController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $stateParams, $window) {
  $rootScope.showContent = false;
  $scope.relatedTags = false;
  $scope.relatedStories = false;
  $scope.relatedStoriesContent = false;
  $scope.loadMoreContent = '';
  $scope.loadMoreCount = 0;
  $scope.skip = 0;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}};
  var relatedTagsRaw = [];
  var writerStoriesFetchCount = 0;
  $window.prerenderReady = false;

  var getWriterProfile = function() {
    contentful
      .entries("include=3&sys.id=" + $stateParams.id)
      .then(function(response) {
        fillWriterProfileContent(response.data.items[0]);
        $scope.showContent = true;
        getWriterStoriesAndTags();
      });
  };

  var getWriterStoriesAndTags = function() {
    getWriterStories();
  };

  var getWriterStories = function() {
    contentful
      .entries("include=3&content_type=article&order=-fields.boost&fields.writer.sys.id=" + $scope.writer.id + "&limit=8&skip=" + $scope.skip)
      .then(function(response) {
        if(response.data.items !== undefined) {
          if($scope.skip === 0) {
            $rootScope.showContent = true;
            $scope.skip = 8;
          } else {
            $scope.skip += 8;
          }
          if(response.data.total > 8 && writerStoriesFetchCount === 0) {
            fillRelatedStoriesContent(response.data.items);
            addLoadMoreCount(response.data.total);
          } else {
            fillLoadMoreContent(response.data.items);
          }
          writerStoriesFetchCount++;
        }
      });
  };

  var fillRelatedStoriesContent = function(relatedStoriesRaw) {
    var count = 0;
    $scope.relatedStoriesContent = {verticalModule1: {}, verticalModule2: {}, verticalModule3: {}, verticalModule4: {}, verticalModule5: {}, verticalModule6: {}, verticalModule7: {}, verticalModule8: {}};
    for(var aModule in $scope.relatedStoriesContent) {
      var anArticle = relatedStoriesRaw[count];
      if(anArticle !== undefined) {
        $scope.relatedStoriesContent[aModule] = {
          id: anArticle.sys.id,
          headline: anArticle.fields !== undefined ? anArticle.fields.title : '',
          writerAndDate: utilityFactory.getWriterFullNameForModules(anArticle),
          image: utilityFactory.getImageUrlForAStory(anArticle),
          imageDescription: anArticle.fields !== undefined && anArticle.fields.articleImageDes !== undefined && anArticle.fields.articleImageDes !== "" ? anArticle.fields.articleImageDes : anArticle.fields.title,
          type: anArticle.sys.contentType.sys.id,
          slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id
        };
        appendToTagsLookup(anArticle.fields.tag);
      }
      count++;
    }
    fillRelatedTagsContent();
  };

  var fillRelatedTagsContent = function() {
    $scope.relatedTags = relatedTagsRaw.splice(0, 5);
  };

  var appendToTagsLookup = function(tags) {
    if(tags !== undefined && tags.length > 0) {
      for(var i = 0; i < tags.length; i++) {
        var aTag = utilityFactory.escapeQuotes(tags[i]);
        relatedTagsRaw.push(aTag);
      }
    }
  };
  var fillWriterProfileContent = function(writerProfileRaw) {
    $scope.writer = {
      id: writerProfileRaw.sys.id,
      name: (writerProfileRaw.fields !== undefined ? writerProfileRaw.fields.name : '') + ' ' + (writerProfileRaw.fields.lastName !== undefined ? writerProfileRaw.fields.lastName : ''),
      university: (writerProfileRaw.fields.university !== undefined && writerProfileRaw.fields.university !== '' ? writerProfileRaw.fields.university + ', ': '') + (writerProfileRaw.fields.city !== undefined ? writerProfileRaw.fields.city : ''),
      twitterUrl: writerProfileRaw.fields !== undefined && writerProfileRaw.fields.twitterUrl !== '' ? writerProfileRaw.fields.twitterUrl : false,
      about: writerProfileRaw.fields !== undefined ? utilityFactory.getContentBodyFromMarkdown(writerProfileRaw.fields.about) : '',
      image: writerProfileRaw.fields !== undefined && writerProfileRaw.fields.writerImage !== null && writerProfileRaw.fields.writerImage !== undefined && writerProfileRaw.fields.writerImage.fields !== undefined ? writerProfileRaw.fields.writerImage.fields.file.url: 'assets/img/profile-img.svg'
    };
    fillMetaTags($scope.writer.name);
    $window.prerenderReady = true;
  };

  var fillMetaTags = function(profileName) {
    $rootScope.metaTags = {
      title: profileName + " - The University Paper",
    };
  };

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=5&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  };

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
          imageDescription: anArticle.fields !== undefined && anArticle.fields.articleImageDes !== undefined && anArticle.fields.articleImageDes !== "" ? anArticle.fields.articleImageDes : anArticle.fields.title,
          type: anArticle.sys.contentType.sys.id,
          slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id
        };
      }
      count++;
    }
    $rootScope.showContent = true;
  };

  /**
    * This function tells how many times a load more will return results.
    */
  var addLoadMoreCount = function(totalItems) {
    if(totalItems > 8) {
      var firstRemainder = totalItems - 8;
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
  };

  $scope.loadMore = function() {
    $scope.loadMoreCount--;
    getWriterStories();
  };

  var fillLoadMoreContent = function(storiesRaw) {
    var i, j, storiesChunk, chunkSize = 4;
    for (i = 0, j = storiesRaw.length; i < j; i += chunkSize) {
      storiesChunk = storiesRaw.slice(i, i + chunkSize);
      $scope.loadMoreContent += fillLoadMoreContentRow(storiesChunk);
    }
  };

  var fillLoadMoreContentRow = function(storiesChunk) {
    var rowContent = '<div class="story-items"><div class="row">';
    for(var i = 0; i < storiesChunk.length; i++) {
      rowContent += fillVerticalModuleWithImage(storiesChunk[i]) + ' ';
    }
    rowContent += '</div></div>';
    return rowContent;
  };

  var fillVerticalModuleWithImage = function(anArticleRaw) {
    var anArticle = {
      id: anArticleRaw.sys.id,
      headline: anArticleRaw.fields !== undefined ? anArticleRaw.fields.title : '',
      writerAndDate: utilityFactory.getWriterFullNameForModules(anArticleRaw),
      image: utilityFactory.getImageUrlForAStory(anArticleRaw),
      type: anArticleRaw.sys.contentType.sys.id,
      slug: anArticleRaw.fields !== undefined && anArticleRaw.fields.urlSlug !== undefined && anArticleRaw.fields.urlSlug !== '' ? anArticleRaw.fields.urlSlug : anArticleRaw.sys.id
    };
    return '<div class="col-md-3 col-sm-3 col-xs-12"><div class="vertical-module with-image' + (anArticle.image === '' ? " module-without-image" : '') + '"><a href="/' + anArticle.type + '/' + anArticle.slug + '"><div class="headline col-xs-6 col-sm-12' + (anArticle.image === '' ? " " + $scope.categoryType : '') + '"><div class="headline-text ng-binding">' + anArticle.headline + '</div><div class="writer-and-date-text ng-binding">' + anArticle.writerAndDate + '</div></div><div class="article-image col-xs-6 col-sm-12"><img src=" ' + anArticle.image + '"></div></a></div></div>';
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/profile/' + $stateParams.id]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getWriterProfile();
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
    getWriterProfile();
    getTopStories();
  }
});
