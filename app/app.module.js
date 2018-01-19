var unipaper = angular.module('unipaper', ['ngMaterial','ui.router', 'contentful', 'ngMessages', 'ngSanitize', '720kb.socialshare', 'cg.mailchimp', 'angular.loadingBar', 'ngAnimate']);
unipaper.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.includeSpinner = true;
});
