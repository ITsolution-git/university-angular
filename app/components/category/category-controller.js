'use strict';

unipaper.controller('categoryController', function($scope, $stateParams, $rootScope, contentful, environmentVariables, utilityFactory, $window) {
  $scope.categoryType = $stateParams.type;
  $rootScope.showContent = false;
  $scope.categoryContent = false;
  $scope.loadMoreContent = '';
  $scope.loadMoreCount = 0;
  $scope.skip = 0;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}};
  $scope.showCategoryContent = false;
  $window.prerenderReady = false;

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=6&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
    $scope.showContent = true;
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
  };

  /**
    * Fills category page with content fetched from getCategoryContent()
    */
  var fillCategoryContent = function(categoryContentRaw) {
    var count = 0;
    $scope.categoryContent = {mainModule: {}, verticalModule1: {}, verticalModule2: {}, horizontalModule: {}, verticalModule3: {}, verticalModule4: {}, verticalModule5: {}, verticalModule6: {}, verticalModule7: {}, verticalModule8: {}, verticalModule9: {}, verticalModule10: {}};
    for(var aModule in $scope.categoryContent) {
      var anArticle = categoryContentRaw[count];
      if(anArticle !== undefined) {
        $scope.categoryContent[aModule] = {
          id: anArticle.sys.id,
          headline: anArticle.fields !== undefined ? anArticle.fields.title : '',
          writerAndDate: utilityFactory.getWriterFullNameForModules(anArticle),
          image: utilityFactory.getImageUrlForAStory(anArticle),
          imageDescription: anArticle.fields !== undefined && anArticle.fields.articleImageDes !== undefined && anArticle.fields.articleImageDes !== "" ? anArticle.fields.articleImageDes : anArticle.fields.title,
          type: anArticle.sys.contentType.sys.id,
          slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id,
        };
      }
      count++;
    }
    fillMetaTags();
    $window.prerenderReady = true;
  };


  /**
    * Fill meta tags with page-relevant content
    */
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
  var fillMetaTags = function() {
    var categoryType = $scope.categoryType.capitalize();
    var descriptionText;
    switch(categoryType){
      case "News":
        descriptionText = "Visit The University Paper News for all the latest news, features, sports, what's on and celebrity interviews for students across the UK.";
        break;
      case "Sports":
        descriptionText = "Visit The University Paper Sports for the latest sports coverage, news, features, what's on and celebrity interview for students across the UK.";
        break;
      case "Entertainment":
        descriptionText = "Get the latest University Paper Entertainment news : features, what's on, celebrity interviews and news, sports coverage for students across the UK.";
        break;
    }
    $rootScope.metaTags = {
      title: $scope.categoryType.capitalize() + " - The University Paper",
      description: descriptionText
    };
  };


  /**
    * Appends content to the category page with the response from getCategoryContent()
    */
  var fillLoadMoreContent = function(categoryContentRaw) {
    var i, j, categoryContentChunk, chunkSize = 4;
    for (i = 0, j = categoryContentRaw.length; i < j; i += chunkSize) {
      categoryContentChunk = categoryContentRaw.slice(i, i + chunkSize);
      $scope.loadMoreContent += fillLoadMoreContentRow(categoryContentChunk);
    }
  };

  /**
    * Fetches content for category page from contentful. On resolution of the promise from contentful, functions to fetch
    * content for other top stories is called.
    */
  var getCategoryContent = function(limit, callbackFunction) {
    contentful
      .entries("fields.category.sys.id=" + environmentVariables.contentfulCategoryIds[$scope.categoryType] + "&content_type=article&include=2&skip=" + $scope.skip + "&limit=" + limit + "&order=-fields.boost&fields.city.sys.id=" + $rootScope.currentCity.id)
      .then(function(response) {
        callbackFunction(response.data.items);
        if(response.data.total > 12 && limit === 12) {
          addLoadMoreCount(response.data.total);
        }
        if($scope.skip === 0) {
          $rootScope.showContent = true;
          $scope.skip = 12;
        } else {
          $scope.skip += 8;
        }
      });
  };

  /**
    * Fills a row of content with a chunk of size 4 of the raw contentful data from fillLoadMoreContent(). Returns HTML as a string
    */
  var fillLoadMoreContentRow = function(categoryContentChunk) {
    var rowContent = '<div class="story-items"><div class="row">';
    for(var i = 0; i < categoryContentChunk.length; i++) {
      rowContent += fillVerticalModuleWithImage(categoryContentChunk[i]);
    }
    rowContent += '</div></div>';
    return rowContent;
  };

  /**
    * Fills a vertical module without image with an article information. Returns HTML as a string
    */
  var fillVerticalModuleWithImage = function(anArticleRaw) {
    var anArticle = {
      id: anArticleRaw.sys.id,
      headline: anArticleRaw.fields !== undefined ? anArticleRaw.fields.title : '',
      writerAndDate: utilityFactory.getWriterFullNameForModules(anArticleRaw),
      image: utilityFactory.getImageUrlForAStory(anArticleRaw),
      imageDescription: anArticleRaw.fields !== undefined && anArticleRaw.fields.articleImageDes !== undefined && anArticleRaw.fields.articleImageDes !== "" ? anArticleRaw.fields.articleImageDes : anArticleRaw.fields.title,
      type: anArticleRaw.sys.contentType.sys.id,
      slug: anArticleRaw.fields !== undefined && anArticleRaw.fields.urlSlug !== undefined && anArticleRaw.fields.urlSlug !== '' ? anArticleRaw.fields.urlSlug : anArticleRaw.sys.id
    };
    return '<div class="col-md-3 col-sm-3 col-xs-12"><div class="vertical-module with-image' + (anArticle.image === '' ? " module-without-image" : '') + '"><a href="/' + anArticle.type + '/' + anArticle.slug + '"><div class="headline col-xs-6 col-sm-12' + (anArticle.image === '' ? " " + $scope.categoryType : '') + '"><div class="headline-text ng-binding">' + anArticle.headline + '</div><div class="writer-and-date-text ng-binding">' + anArticle.writerAndDate + '</div></div><div class="article-image col-xs-6 col-sm-12"><img src="' + anArticle.image + '" alt="' + anArticle.imageDescription + '" /></div></a></div></div>';  };

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
  };

  /**
    * This function triggers getCategoryCount with a skip value. It is triggered on click of load more button in the view
    */
  $scope.loadMore = function() {
    $scope.loadMoreCount--;
    getCategoryContent(8, fillLoadMoreContent);
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/category/' + $scope.categoryType]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * The broadcast listener for the event 'changeCategoryContent'. The event is broadcasted on change of location dropdown in the nav bar
    */
  $scope.$on('changeCategoryContent', function(event, args) {
    $scope.skip = 0;
    $scope.showCategoryContent = false;
    getCategoryContent(12, fillCategoryContent);
  });

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getCategoryContent(12, fillCategoryContent);
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
    getCategoryContent(12, fillCategoryContent);
    getTopStories();
  }
});
