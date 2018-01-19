'use strict';

unipaper.controller('articleController', function($scope, contentful, environmentVariables, $rootScope, $stateParams, utilityFactory, $state, $window, $http) {
  $rootScope.showContent = false;
  $scope.articleSlug = $stateParams.slug;
  $scope.article = false;
  $scope.relatedTags = false;
  $scope.relatedStories = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}, horizontalModule5: {}, horizontalModule6: {}, horizontalModule7: {}, horizontalModule8: {}};
  $scope.relatedStoriesContent = false;
  $scope.showScript = false;
  $window.prerenderReady = false;

  /**
    * Fetches article information from contentful using $scope.articleId
    */
  var getArticle = function() {
    contentful
      .entries("content_type=article&fields.urlSlug=" + $scope.articleSlug + "&include=6")
      .then(function(response) {
        var articleRaw = response.data.items[0];
        if(articleRaw !== undefined) {
          fillArticleContent(articleRaw);
        } else {
          getArticleWithId();
        }
        getTopStories();
        $rootScope.showContent = true;
      });
  };

  var getArticleWithId = function() {
    contentful
      .entries("content_type=article&sys.id=" + $scope.articleSlug + "&include=6")
      .then(function(response) {
        var articleRaw = response.data.items[0];
        if(articleRaw !== undefined) {
          fillArticleContent(articleRaw);
        } else {
          $scope.articleError = 'Nothing found.';
          return false;
        }
      })
  };

  var fillArticleContent = function(articleRaw) {
    $scope.article = {
      id: articleRaw.sys.id,
      title: articleRaw.fields.title,
      subHeading: articleRaw.fields.subHeading !== undefined ? articleRaw.fields.subHeading : '',
      image: utilityFactory.getImageUrlForAStory(articleRaw),
      imgDescription: articleRaw.fields !== undefined && articleRaw.fields.articleImage !== undefined && articleRaw.fields.articleImage.fields !== undefined && articleRaw.fields.articleImage.fields.description !== undefined && articleRaw.fields.articleImage.fields.description !== '' ? articleRaw.fields.articleImage.fields.description : '',
      articleImageDes: articleRaw.fields !== undefined && articleRaw.fields.articleImageDes !== undefined || articleRaw.fields.articleImageDes !== '' ? articleRaw.fields.articleImageDes : '',
      content: utilityFactory.getContentBodyFromMarkdown(articleRaw.fields.contentBody),
      writer: articleRaw.fields !== undefined && articleRaw.fields.writer !== undefined && articleRaw.fields.writer.fields !== undefined ? articleRaw.fields.writer.fields.name + ' ' + articleRaw.fields.writer.fields.lastName : '',
      writerId: articleRaw.fields.writer !== undefined ? articleRaw.fields.writer.sys.id : '',
      writerImage: articleRaw.fields !== undefined && articleRaw.fields.writer !== undefined && articleRaw.fields.writer.fields !== undefined && articleRaw.fields.writer.fields.writerImage !== undefined && articleRaw.fields.writer.fields.writerImage.fields !== undefined ? articleRaw.fields.writer.fields.writerImage.fields.file.url: 'assets/img/author.svg',
      writerFbPage: articleRaw.fields !== undefined && articleRaw.fields.writer !== undefined && articleRaw.fields.writer.fields !== undefined && articleRaw.fields.writer.fields.facebookUrl !== undefined ? articleRaw.fields.writer.fields.facebookUrl : '',
      date: utilityFactory.getStoryDate(articleRaw),
      slug: articleRaw.fields !== undefined && articleRaw.fields.urlSlug !== undefined && articleRaw.fields.urlSlug !== '' ? encodeURIComponent(articleRaw.fields.urlSlug) : articleRaw.sys.id,
      scriptsToInject: articleRaw.fields !== undefined && articleRaw.fields.scriptsToInject !== undefined && articleRaw.fields.scriptsToInject !== '' ? articleRaw.fields.scriptsToInject : ''
    };
    postscribe('#articleContent', $scope.article.content);
    postscribe('#mainContent', $scope.article.scriptsToInject);
    $scope.articleError = false;
    fillMetaTags();
    $window.prerenderReady = true;
    analytics.ready(trackPageView);
    fillRelatedTagsAndStoriesContent(articleRaw.fields.tag, articleRaw.fields.relatedArticle !== undefined ? articleRaw.fields.relatedArticle : []);
  };

  /**
    * Fetches top stories for city "National"
    */
  var getTopStories = function() {
    contentful
      .entries("content_type=article&include2&limit=8&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
      .then(function(response) {
        fillTopStoriesContent(response.data.items);
      });
  };

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
          headline: anArticle.fields.title,
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
    * Fills related tags content after processing raw information
    */
  var fillRelatedTagsContent = function(relatedTagsRaw) {
    $scope.relatedTags = [];
    if(relatedTagsRaw !== undefined) {
      for(var i = 0; i < relatedTagsRaw.length; i++) {
        var aTag = utilityFactory.escapeQuotes(relatedTagsRaw[i]);
        $scope.relatedTags.push(aTag);
      }
    }
  };

  /**
    * Fills related stories content after processing raw information
    */
  var fillRelatedStoriesContent = function(relatedStoriesRaw) {
    var count = 0;
    if(relatedStoriesRaw.length > 0) {
      $scope.relatedStoriesContent = {verticalModule1: {}, verticalModule2: {}, verticalModule3: {}, verticalModule4: {}};
      for(var aModule in $scope.relatedStoriesContent) {
        var aStory = relatedStoriesRaw[count];
        if(aStory !== undefined) {
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
    * Fills related tags and stories informaton fetched from getArticle() into related tags' and stories' modules
    */
  var fillRelatedTagsAndStoriesContent = function(relatedTagsRaw, relatedStoriesRaw) {
    fillRelatedTagsContent(relatedTagsRaw);
    if(relatedStoriesRaw !== undefined) {
      fillRelatedStoriesContent(relatedStoriesRaw);
    }
  };

  /**
    * This function tracks number of views for an article using the Segment API
    */
  var trackPageView = function() {
    if (typeof analytics !== 'undefined') {
      var anonymousId = analytics.user().anonymousId(); //for adding anonymousId as a property explicitly
      analytics.page('Story', {
        u_id: anonymousId,
        c_id: $scope.article.id,
        type: 'article'
      }, {
        integrations: {
          'All': false,
          'Keen IO': true
        }
      });
    }
    
    var pushed = false;
    while (pushed === false) {
      if (_paq !== undefined) {
        _paq.push(['setCustomDimension', 2, $scope.article.id]);
        _paq.push(['trackPageView']);
        pushed = true;
      }
    }
  };

  /**
    * Fill meta tags with page-relevant content
    */
  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: $scope.article.title + " ",
      ogUrl: environmentVariables.domainName + '/article/' + $scope.article.slug,
      ogImage: $scope.article.image,
      description: $scope.article.title + $scope.article.subHeading
    };
    $rootScope.articleMetaTags = {
      authorFbPage: $scope.article.writerFbPage
    };
    shareSelectedText('.article-content');
  };

  $scope.goToWritersProfile = function(writersId) {
    $state.go('profile', {id: writersId});
  };

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
    _hsq.push(['setPath', '/article/' + $scope.articleSlug]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getArticle();
  });

  /**
    * This block checks if the environment is already initialized when the partial loads. If not nothing happens
    * and the view waits for the 'initialized' event to be broadcasted
    */
  if($rootScope.environmentInitialized === true) {
    getArticle();
  }
});
