'use strict';

unipaper.directive('facebookComments', function() {
  var createHTML = function(href, numposts) {
    return '<div class="fb-comments" ' +
      'data-href="' + href + '" ' +
      'data-width="100%"' +
      'data-numposts="' + numposts + '" ' +
      '</div>';
  }

  return {
    restrict: 'A',
    scope: {},
    link: function postLink(scope, elem, attrs) {
      attrs.$observe('pageHref', function (newValue) {
        var href = newValue;
        var numposts = attrs.numposts || 2;

        elem.html(createHTML(href, numposts));
        if(typeof(FB) != undefined && FB != null) {
          FB.XFBML.parse(elem[0]);
        } else {
          //do nothing
        }
      });
    }
  }
});

unipaper.directive('facebookCommentsCount', function() {
  var createHTML = function(href) {
    return '<span class="fb-comments-count" ' +
      'data-href="' + href + '" ' +
      '</div>';
  }

  return {
    restrict: 'A',
    scope: {},
    link: function postLink(scope, elem, attrs) {
      attrs.$observe('href', function (newValue) {
        var href = newValue;

        elem.html(createHTML(href));
        if(typeof(FB) != undefined && FB != null) {
          FB.XFBML.parse(elem[0]);
        } else {
          //do nothing
        }
      });
    }
  }
});
