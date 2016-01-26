/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function appToolbarDrct( $window, $rootScope ) {
        return {
            restrict: 'E',
            templateUrl: 'drcts/toolbar/templates/app-toolbar.html',
            controller: 'appToolbarController'
        };
    };
    angular.module( 'gif-finder').directive( 'appToolbar', appToolbarDrct );
})();