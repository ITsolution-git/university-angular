'use strict';

unipaper.controller('listicleController', function($scope, $rootScope, contentful, utilityFactory, $stateParams, environmentVariables, $state, $window) {
  $rootScope.showContent = false;
  $scope.relatedTags = false;
  $scope.relatedStories = false;
  $scope.relatedStoriesContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}};
  $window.prerenderReady = false;

  var getListicle = function() {
    contentful
      .entries("include=4&content_type=listicle&fields.urlSlug=" + $stateParams.slug)
      .then(function(response) {
        var listicleRaw = response.data.items[0];
        if(listicleRaw !== undefined) {
          fillListicleContent(listicleRaw);
        } else {
          getListicleWithId();
        }
        $rootScope.showContent = true;
      });
  }

  var getListicleWithId = function() {
    contentful
      .entries("include=4&content_type=listicle&sys.id=" + $stateParams.slug)
      .then(function(response) {
        var listicleRaw = response.data.items[0];
        if(listicleRaw !== undefined) {
          fillListicleContent(listicleRaw);
        } else {
          $scope.listicleError = 'Nothing found';
        }
      });
  }

  var fillListicleContent = function(listicleRaw) {
    $scope.listicle = {
      id: listicleRaw.sys.id,
      title: listicleRaw.fields !== undefined ? listicleRaw.fields.title : '',
      subHeading: listicleRaw.fields.subHeading !== undefined ? listicleRaw.fields.subHeading : '',
      image: utilityFactory.getImageUrlForAStory(listicleRaw),
      content: utilityFactory.getContentBodyFromMarkdown(listicleRaw.fields.contentBody),
      writer: listicleRaw.fields !== undefined && listicleRaw.fields.writer !== undefined && listicleRaw.fields.writer.fields !== undefined ? listicleRaw.fields.writer.fields.name + ' ' + listicleRaw.fields.writer.fields.lastName : '',
      writerId: listicleRaw.fields !== undefined && listicleRaw.fields.writer !== undefined ? listicleRaw.fields.writer.sys.id : '',
      writerImage: listicleRaw.fields !== undefined && listicleRaw.fields.writer.fields.writerImage !== undefined && listicleRaw.fields.writer.fields.writerImage.fields !== undefined ? listicleRaw.fields.writer.fields.writerImage.fields.file.url: 'assets/img/author.svg',
      writerFbPage: listicleRaw.fields !== undefined && listicleRaw.fields.writer !== undefined && listicleRaw.fields.writer.fields !== undefined && listicleRaw.fields.writer.fields.facebookUrl !== undefined ? listicleRaw.fields.writer.fields.facebookUrl : '',
      date: utilityFactory.getStoryDate(listicleRaw),
      slug: listicleRaw.fields !== undefined && listicleRaw.fields.urlSlug !== undefined && listicleRaw.fields.urlSlug !== '' ? listicleRaw.fields.urlSlug : listicleRaw.sys.id,
      listItems: getListItems(listicleRaw),
    }
    fillMetaTags();
    $window.prerenderReady = true;
    analytics.ready(trackPageView);
    fillRelatedTagsAndStoriesContent(listicleRaw.fields.tag, listicleRaw.fields.relatedListicle);
  }

  var getListItems = function(listicleRaw) {
    var listItems = [];
    for(var i = 1; i <= 5; i++) {
      if(listicleRaw.fields['item' + i + 'title'] === undefined) {
        continue;
      }
      if(listicleRaw.fields['item' + i + 'title'] !== '') {
        var listItem = {
          title: listicleRaw.fields['item' + i + 'title'],
          image: listicleRaw.fields['item' + i + 'image'] !== undefined ? listicleRaw.fields['item' + i + 'image'].fields.file.url : '',
          contentBody: listicleRaw.fields['item' + i + 'contentBody'],
          type: listicleRaw.sys.contentType.sys.id
        };
        listItems.push(listItem);
      }
    }
    return listItems;
  }

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
  }

  /**
    * Fills related stories content after processing raw information
    */
  var fillRelatedStoriesContent = function(relatedStoriesRaw) {
    var count = 0;
    if(relatedStoriesRaw.length > 0) {
      $scope.relatedStoriesContent = {horizontalModuleWithoutImage1: {}, horizontalModule1: {}, horizontalModuleWithoutImage2: {}, horizontalModule2: {}};
      for(var aModule in $scope.relatedStoriesContent) {
        var aStory = relatedStoriesRaw[count];
        if(aStory !== undefined) {
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

  /**
    * Fills related tags and stories informaton fetched from getArticle() into related tags' and stories' modules
    */
  var fillRelatedTagsAndStoriesContent = function(relatedTagsRaw, relatedStoriesRaw) {
    fillRelatedTagsContent(relatedTagsRaw);
    if(relatedStoriesRaw !== undefined) {
      fillRelatedStoriesContent(relatedStoriesRaw);
    }
  }

  var getTopStories = function() {
    contentful
      .entries("content_type=article&include=2&limit=5&order=-fields.boost&fields.city.sys.id=" + utilityFactory.getCityIdFromName('national'))
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
          headline: anArticle.fields.title,
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
    * Fill meta tags with page-relevant content
    */
  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: $scope.listicle.title + " ",
      ogUrl: environmentVariables.domainName + '/listicle/' + $scope.listicle.slug,
      ogImage: $scope.listicle.image,
      description: $scope.listicle.title + $scope.listicle.subHeading
    };
    $rootScope.articleMetaTags = {
      authorFbPage: $scope.listicle.writerFbPage
    };
    shareSelectedText('.article-content');
  }

  /**
    * This function tracks number of views for an article using the Segment API
    */
  var trackPageView = function() {
    if (typeof analytics !== 'undefined') {
      var anonymousId = analytics.user().anonymousId(); //for adding anonymousId as a property explicitly
      analytics.page('Story', {
        u_id: anonymousId,
        c_id: $scope.listicle.id,
        type: 'listicle'
      }, {
        integrations: {
          'All': false,
          'Keen IO': true
        }
      });
    }
  };

  $scope.goToWritersProfile = function(writersId) {
    $state.go('profile', {id: writersId});
  };

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/listicle/' + $stateParams.slug]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getListicle();
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
    getListicle();
    getTopStories();
  }
});
