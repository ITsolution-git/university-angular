'use strict';

unipaper.controller('galleryController', function($scope, $rootScope, contentful, utilityFactory, environmentVariables, $stateParams, $state, $window) {
  $rootScope.showContent = false;
  $scope.relatedTags = false;
  $scope.relatedStories = false;
  $scope.relatedStoriesContent = false;
  $scope.topStoriesContent = {horizontalModule1: {}, horizontalModule2: {}, horizontalModule3: {}, horizontalModule4: {}};
  $window.prerenderReady = false;

  var getGallery = function() {
    contentful
      .entries("include=4&content_type=gallery&fields.urlSlug=" + $stateParams.slug)
      .then(function(response) {
        var galleryRaw = response.data.items[0];
        if(galleryRaw !== undefined) {
          fillGalleryContent(galleryRaw);
        } else {
          getGalleryWithId();
        }
      });
  }

  var getGalleryWithId = function() {
    contentful
      .entries("include=4&content_type=gallery&sys.id=" + $stateParams.slug)
      .then(function(response) {
        var galleryRaw = response.data.items[0];
        if(galleryRaw !== undefined) {
          fillGalleryContent(galleryRaw);
        } else {
          $scope.galleryError = 'Nothing found';
        }
      });
  }

  var fillGalleryContent = function(galleryRaw) {
    $scope.gallery = {
      id: galleryRaw.sys.id,
      title: galleryRaw.fields.title,
      subHeading: galleryRaw.fields.subHeading !== undefined ? galleryRaw.fields.subHeading : '',
      image: utilityFactory.getImageUrlForAStory(galleryRaw),
      content: utilityFactory.getContentBodyFromMarkdown(galleryRaw.fields.contentBody),
      writer: galleryRaw.fields !== undefined && galleryRaw.fields.writer !== undefined && galleryRaw.fields.writer.fields !== undefined ? galleryRaw.fields.writer.fields.name + ' ' + galleryRaw.fields.writer.fields.lastName : '',
      writerId: galleryRaw.fields !== undefined && galleryRaw.fields.writer !== undefined ? galleryRaw.fields.writer.sys.id : '',
      writerImage: galleryRaw.fields !== undefined && galleryRaw.fields.writer.fields.writerImage !== undefined && galleryRaw.fields.writer.fields.writerImage.fields !== undefined ? galleryRaw.fields.writer.fields.writerImage.fields.file.url : 'assets/img/author.svg',
      writerFbPage: galleryRaw.fields !== undefined && galleryRaw.fields.writer !== undefined && galleryRaw.fields.writer.fields !== undefined && galleryRaw.fields.writer.fields.facebookUrl !== undefined ? galleryRaw.fields.writer.fields.facebookUrl : '',
      date: utilityFactory.getStoryDate(galleryRaw),
      slug: galleryRaw.fields !== undefined && galleryRaw.fields.urlSlug !== undefined && galleryRaw.fields.urlSlug !== '' ? galleryRaw.fields.urlSlug : galleryRaw.sys.id,
      galleryItems: getListItems(galleryRaw),
    }
    fillMetaTags();
    $window.prerenderReady = true;
    analytics.ready(trackPageView);
    fillRelatedTagsAndStoriesContent(galleryRaw.fields.tag, galleryRaw.fields.relatedGallery);
  }

  var getListItems = function(galleryRaw) {
    var listItems = [];
    for(var i = 1; i <= 10; i++) {
      if(galleryRaw.fields['item' + i + 'image'] === undefined) {
        continue;
      } else {
        var listItem = {
          image: galleryRaw.fields['item' + i + 'image'].fields !== undefined ? galleryRaw.fields['item' + i + 'image'].fields.file.url : '',
          contentBody: galleryRaw.fields['item' + i + 'contentBody'] !== undefined ? galleryRaw.fields['item' + i + 'contentBody'] : '',
          type: galleryRaw.sys.contentType.sys.id
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
    $rootScope.showContent = true;
  }

  /**
    * Fill meta tags with page-relevant content
    */
  var fillMetaTags = function() {
    $rootScope.metaTags = {
      title: $scope.gallery.title + " ",
      ogUrl: environmentVariables.domainName + '/gallery/' + $scope.gallery.slug,
      ogImage: $scope.gallery.image,
      description: $scope.gallery.title + $scope.gallery.subHeading
    };
    $rootScope.articleMetaTags = {
      authorFbPage: $scope.gallery.writerFbPage
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
        c_id: $scope.gallery.id,
        type: 'gallery'
      }, {
        integrations: {
          'All': false,
          'Keen IO': true
        }
      });
    }
  }

  $scope.goToWritersProfile = function(writersId) {
    $state.go('profile', {id: writersId});
  }

  /**
    * hubSpotInitialTrackCompleted will have the value 1 if this page is the initial load of the website
    */
  if (hubSpotInitialTrackCompleted === undefined) {
    var _hsq = window._hsq = window._hsq || [];
    _hsq.push(['setPath', '/gallery/' + $stateParams.slug]);
    _hsq.push(['trackPageView']);
  } else {
    hubSpotInitialTrackCompleted = undefined;
  }

  /**
    * This listener listens to event 'initialized' broadcasted from mainLayoutController after initializing environment
    */
  $scope.$on('initialized', function(event) {
    getGallery();
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
    getGallery();
    getTopStories();
  }
});
