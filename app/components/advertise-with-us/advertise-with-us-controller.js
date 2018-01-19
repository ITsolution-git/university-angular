'use strict';

unipaper.controller('advertiseWithUsController', function($scope, contentful, environmentVariables, $rootScope, utilityFactory, $window) {
  $rootScope.showContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}};
  $window.prerenderReady = false;

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=6&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
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
          imageDescription: anArticle.fields !== undefined && anArticle.fields.articleImageDes !== undefined && anArticle.fields.articleImageDes !== "" ? anArticle.fields.articleImageDes : anArticle.fields.title,
          type: anArticle.sys.contentType.sys.id,
          slug: anArticle.fields !== undefined && anArticle.fields.urlSlug !== undefined && anArticle.fields.urlSlug !== '' ? anArticle.fields.urlSlug : anArticle.sys.id
        };
      }
      count++;
    }
    $rootScope.showContent = true;
    fillMetaTags();
    $window.prerenderReady = true;
  }

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/advertise-with-us']);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: "Advertise with us - The University Paper",
    };
  };

  var addLeadForensicsScript = function() {
    var script = document.createElement('script');
    script.type='text/javascript';
    script.src='https://secure.leadforensics.com/js/123992.js';
    document.getElementsByTagName('head')[0].appendChild(script);

    var noScript = document.createElement('noscript');
    var noScriptImg = document.createElement('img');
    noScriptImg.alt = "";
    noScriptImg.src = "https://secure.leadforensics.com/123992.png";
    noScriptImg.style = "display:none";
    noScript.appendChild(noScriptImg);
    document.getElementsByTagName('head')[0].appendChild(noScript);
  };

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getTopStories();
  });

  /**
    * For functions that require the partial's content to be loaded
    */
  $scope.$on('$viewContentLoaded', function(event, viewName, viewContent) {
    utilityFactory.executeAdTags();
    $rootScope.pageViewForGoogleAnalytics();
    addLeadForensicsScript();
  });

  /**
    * This block checks if the environment is already initialized when the partial loads. If not nothing happens
    * and the view waits for the 'initialized' event to be broadcasted
    */
  if($rootScope.environmentInitialized === true) {
    getTopStories();
  }
});
