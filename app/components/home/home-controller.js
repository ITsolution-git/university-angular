'use strict';

unipaper.controller('homeController', function($scope, $timeout, contentful, environmentVariables, $rootScope, utilityFactory) {
  $rootScope.metaTags = {
    title: "The University Paper",
    ogType: "website",
    ogUrl: environmentVariables.domainName + '/home',
    ogImage: environmentVariables.domainName + '/assets/img/unipaper-square-logo.jpg',
    description: "The University Paper - all the latest news, features, sports, what's on and celebrity interviews for students across the UK"
  };
  $scope.topNewsContent = {mainModule: {}, verticalModule: {}, verticalModuleWithImage: {}, horizontalModule: {}};
  $scope.topEntertainmentContent = {galleryModule: {}, horizontalModule: '', verticalModule: '', verticalModule1: {}, verticalModule2: {}, horizontalModuleWithoutImage1: '', horizontalModuleWithoutImage2: '', horizontalModuleWithoutImage3: ''};
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}, horizontalModule9: {}, horizontalModule10: {}, horizontalModule11: {}, horizontalModule12: {}};
  var articlesRaw = [], listiclesRaw = [], galleriesRaw = [];
  var topNewsContentRaw = [], topCityContentRaw = [], topEntertainmentContentRaw = [], topStoriesContentRaw = [];
  $scope.promiseCount = 0;
  $scope.topCityContentPromiseCount = 0;
  $scope.showTopCityContent = false;

  /**
    * Fills top news section with content fetched from getTopNewsContent()
    */
  var fillTopNewsContent = function() {
    var count = 0;
    for(var aModule in $scope.topNewsContent) {
      var anArticle = topNewsContentRaw[count];
      if(anArticle !== undefined) {
        $scope.topNewsContent[aModule] = {
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
  }

  /**
    * Fills top entertainment section with content fetched from getTopEntertainmentContent()
    */
  var fillTopEntertainmentContent = function() {
    var count = 0;
    for(var aModule in $scope.topEntertainmentContent) {
      var anArticle = topEntertainmentContentRaw[count];
      if(anArticle !== undefined) {
        $scope.topEntertainmentContent[aModule] = {
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
  }

  var getTopCityContent = function() {
    contentful
      .entries("content_type=article&include=2&limit=5&order=-fields.boost&fields.city.sys.id=" + $rootScope.currentCity.id)
      .then(function(response) {
        articlesRaw = response.data.items;
        $scope.topCityContentPromiseCount++;
      });
    contentful
      .entries("content_type=listicle&include=2&limit=5&order=-fields.boost&fields.city.sys.id=" + $rootScope.currentCity.id)
      .then(function(response) {
        listiclesRaw = response.data.items;
        $scope.topCityContentPromiseCount++;
      });
    contentful
      .entries("content_type=gallery&include=2&limit=5&order=-fields.boost&fields.city.sys.id=" + $rootScope.currentCity.id)
      .then(function(response) {
        galleriesRaw = response.data.items;
        $scope.topCityContentPromiseCount++;
      });
  }

  /**
    * Fills top entertainment section with content fetched from getTopCityContent()
    */
  var fillTopCityContent = function() {
    var count = 0;
    $scope.topCityContent = {galleryModule: {}, horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}, horizontalModule9: {}, horizontalModule10: {}, horizontalModule11: {}, horizontalModule12: {}};
    for(var aModule in $scope.topCityContent) {
      var anArticle = topCityContentRaw[count];
      if(anArticle !== undefined) {
        $scope.topCityContent[aModule] = {
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
    $scope.showTopCityContent = true;
  }

  /**
    * Fills top stories section with content fetched from getTopStories()
    */
  var fillTopStoriesContent = function() {
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
  }

  var getHomePageContent = function() {
    contentful
      .entries(/*"fields.category.sys.id[in]=" + environmentVariables.contentfulCategoryIds.news + "," + environmentVariables.contentfulCategoryIds.entertainment +*/ "include=3&content_type=article&order=-fields.boost&limit=150&fields.city.sys.id[in]=" + utilityFactory.getCityIdFromName('national') + "," + $rootScope.currentCity.id)
      .then(function(response) {
        articlesRaw = response.data.items;
        $scope.promiseCount++;
      });
    contentful
      .entries(/*"fields.category.sys.id[in]=" + environmentVariables.contentfulCategoryIds.news + "," + environmentVariables.contentfulCategoryIds.entertainment +*/ "include=3&content_type=listicle&order=-fields.boost&fields.city.sys.id[in]=" + utilityFactory.getCityIdFromName('national') + "," + $rootScope.currentCity.id)
      .then(function(response) {
        listiclesRaw = response.data.items;
        $scope.promiseCount++;
      });
    contentful
      .entries(/*"fields.category.sys.id[in]=" + environmentVariables.contentfulCategoryIds.news + "," + environmentVariables.contentfulCategoryIds.entertainment +*/ "include=3&content_type=gallery&order=-fields.boost&fields.city.sys.id[in]=" + utilityFactory.getCityIdFromName('national') + "," + $rootScope.currentCity.id)
      .then(function(response) {
        galleriesRaw = response.data.items;
        $scope.promiseCount++;
      });
  }

  var mapAllStoriesToContents = function() {
    mapStoriesToContent(articlesRaw);
    mapStoriesToContent(listiclesRaw);
    mapStoriesToContent(galleriesRaw);
  }

  var mapStoriesToContent = function(storiesRaw) {
    for(var i = 0; i < storiesRaw.length; i++) {
      var aStory = storiesRaw[i];
      var isNationalStory = isEntryMappedToArticle(aStory.fields.city, utilityFactory.getCityIdFromName('national')), isCurrentCityStory = isEntryMappedToArticle(aStory.fields.city, $rootScope.currentCity.id), isNewsStory = isEntryMappedToArticle(aStory.fields.category, environmentVariables.contentfulCategoryIds.news), isEntertainmentStory = isEntryMappedToArticle(aStory.fields.category, environmentVariables.contentfulCategoryIds.entertainment);
      mapStoryToAllContents(isNationalStory, isCurrentCityStory, isNewsStory, isEntertainmentStory, aStory);
    }
  }

  var mapStoryToAllContents = function(isNationalStory, isCurrentCityStory, isNewsStory, isEntertainmentStory, aStory) {
    mapToTopStories(isNationalStory, aStory);
    mapToTopNews(isNationalStory, isNewsStory, aStory);
    mapToTopEntertainment(isNationalStory, isEntertainmentStory, aStory);
    mapToTopCity(isCurrentCityStory, aStory);
  }

  var mapToTopStories = function(isNationalStory, aStory) {
    if(isNationalStory, aStory) {
      topStoriesContentRaw.push(aStory);
    }
    sortStoriesByBoost(topStoriesContentRaw);
  }

  var mapToTopNews = function(isNationalStory, isNewsStory, aStory) {
    if(isNationalStory && isNewsStory) {
      topNewsContentRaw.push(aStory);
    }
    sortStoriesByBoost(topNewsContentRaw);
  }

  var mapToTopEntertainment = function(isNationalStory, isEntertainmentStory, aStory) {
    if(isNationalStory && isEntertainmentStory) {
      topEntertainmentContentRaw.push(aStory);
    }
    sortStoriesByBoost(topEntertainmentContentRaw);
  }

  var mapToTopCity = function(isCurrentCityStory, aStory) {
    if(isCurrentCityStory) {
      topCityContentRaw.push(aStory);
    }
    sortStoriesByBoost(topCityContentRaw);
  }

  var isEntryMappedToArticle = function(entriesArray, entryId) {
    if(entriesArray !== undefined) {
      for(var i = 0; i < entriesArray.length; i++) {
        var anEntry = entriesArray[i];
        if(anEntry.sys.id === entryId) {
          return true;
        }
      }
      return false;
    }
  }

  var sortStoriesByBoost = function(storiesRaw) {
    for(var i = 0; i < storiesRaw.length; i++) {
      for(var j = i + 1; j < storiesRaw.length; j++) {
        if(storiesRaw[i].fields.boost < storiesRaw[j].fields.boost) {
          var result = swapValues(storiesRaw[i], storiesRaw[j]);
          storiesRaw[i] = result[0], storiesRaw[j] = result[1];
        }
      }
    }
    return storiesRaw;
  }

  var swapValues = function(a, b) {
    var temp = b;
    b = a;
    a = temp;
    return [a, b];
  }

  var fillAllContentsWithStories = function() {
    fillTopNewsContent();
    fillTopCityContent();
    fillTopEntertainmentContent();
    fillTopStoriesContent();
  }

  $scope.$watch('promiseCount', function() {
    if($scope.promiseCount === 3) {
      mapAllStoriesToContents();
      fillAllContentsWithStories();
      $rootScope.showContent = true;
    }
  });

  $scope.$watch('topCityContentPromiseCount', function() {
    if($scope.topCityContentPromiseCount !== 0 && $scope.topCityContentPromiseCount % 3 === 0) {
      var allStoriesRaw = articlesRaw.concat(listiclesRaw.concat(galleriesRaw));
      topCityContentRaw = sortStoriesByBoost(allStoriesRaw);
      fillTopCityContent();
    } else {
      $scope.showTopCityContent = false;
    }
  });

  /**
    * The broadcast listener for the event 'changeBestOfCityContent'. The event is broadcasted on change of location dropdown in the nav bar
    */
  $scope.$on('changeBestOfCityContent', function(event, args) {
    getTopCityContent();
  });

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event, args) {
    getHomePageContent();
  });

  /**
    * This block checks if the environment is already initialized when the partial loads. If not nothing happens
    * and the view waits for the 'initialized' event to be broadcasted
    */
  if($rootScope.environmentInitialized === true) {
    getHomePageContent();
  }

  /**
    * For functions that require the partial's content to be loaded
    */
  $scope.$on('$viewContentLoaded', function(event) {
    utilityFactory.executeAdTags();
    $rootScope.pageViewForGoogleAnalytics();
  });

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/home']);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }
});
