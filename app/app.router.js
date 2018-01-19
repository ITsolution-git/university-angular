unipaper.config(function($stateProvider, $urlRouterProvider, contentfulProvider, $locationProvider, environmentVariables, $mdThemingProvider, CgMailChimpServiceProvider) {
    
  $urlRouterProvider.otherwise('/home');
  
  $mdThemingProvider.theme('input'); //registering a theme is necessary to prevent warnings on console
  
  $locationProvider.html5Mode(true);
  
  CgMailChimpServiceProvider.setConfig({
    username: 'unipaper',
    dc: 'us13',
    u: '2ee055b6fba7c90a95fde0a33',
    id:''
  });

  $stateProvider

    .state('main', {
      abstract: true,
      views: {
        '': {
          templateUrl: 'app/shared/layouts/main-layout-view.html',
          controller: 'mainLayoutController'
        }
      }
    })
          
    .state('home', {
      parent: 'main',
      url: '/home',
      views: {
        '': {
          templateUrl: 'app/components/home/home-view.html',
          controller: 'homeController'
        }
      }
    })
  
    .state('article', {
      parent: 'main',
      url: '/article/:slug',
      params: {
        slug: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/article/article-view.html',
          controller: 'articleController'
        }
      }
    })
  
    .state('listicle', {
      parent: 'main',
      url: '/listicle/:slug',
      params: {
        slug: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/listicle/listicle-view.html',
          controller: 'listicleController'
        }
      }
    })
  
    .state('gallery', {
      parent: 'main',
      url: '/gallery/:slug',
      params: {
        slug: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/gallery/gallery-view.html',
          controller: 'galleryController'
        }
      }
    })

    .state('category', {
      parent: 'main',
      url: '/category/:type',
      params: {
        type: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/category/category-view.html',
          controller: 'categoryController'
        }
      }
    })
  
    .state('deals', {
      parent: 'main',
      url: '/deals',
      views: {
        '': {
          templateUrl: 'app/components/deals/deals-view.html',
          controller: 'dealsController'
        }
      }
    })
  
    .state('deal', {
      parent: 'main',
      url: '/deal/:id',
      params: {
        id: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/deals/deal-detail-view.html',
          controller: 'dealDetailController'
        }
      }
    })
  
    .state('wins', {
      parent: 'main',
      url: '/competitions',
      views: {
        '': {
          templateUrl: 'app/components/win/wins-view.html',
          controller: 'winsController'
        }
      }
    })
  
    .state('win', {
      parent: 'main',
      url: '/competitions/:id',
      params: {
        id: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/win/win-detail-view.html',
          controller: 'winDetailController'
        }
      }
    })
  
    .state('tag-results', {
      parent: 'main',
      url: '/tag-results/:tag',
      views: {
        '': {
          templateUrl: 'app/components/tag-results/tag-results-view.html',
          controller: 'tagResultsController'
        }
      }
    })
  
    .state('the-paper', {
      parent: 'main',
      url: '/the-paper',
      views: {
        '': {
          templateUrl: 'app/components/the-paper/the-paper-view.html',
          controller: 'thePaperController'
        }
      }
    })
  
    .state('profile', {
      parent: 'main',
      url: '/profile/:id',
      params: {
        id: ''
      },
      views: {
        '': {
          templateUrl: 'app/components/profile/profile-view.html',
          controller: 'profileController'
        }
      }
    })
  
    .state('about-us', {
      parent: 'main',
      url: '/about-us',
      views: {
        '': {
          templateUrl: 'app/components/about-us/about-us-view.html',
          controller: 'aboutUsController'
        }
      }
    })
  
    .state('advertise-with-us', {
      parent: 'main',
      url: '/advertise-with-us',
      views: {
        '': {
          templateUrl: 'app/components/advertise-with-us/advertise-with-us-view.html',
          controller: 'advertiseWithUsController'
        }
      }
    })
  
    .state('write-for-us', {
      parent: 'main',
      url: '/write-for-us',
      views: {
        '': {
          templateUrl: 'app/components/write-for-us/write-for-us-view.html',
          controller: 'writeForUsController'
        }
      }
    });
  
  contentfulProvider.setOptions({
    space: environmentVariables.contentfulSpaceId,
    accessToken: environmentVariables.contentfulAccessToken,
  });
  
});

unipaper.run(function() {
  
});