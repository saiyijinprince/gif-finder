/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function appContainerDrct( $window, $rootScope ) {
        return {
            restrict: 'E',
            templateUrl: 'drcts/container/templates/app-container.html',
            controller: 'appContainerCtrl'
        };
    };
    angular.module( 'gif-finder').directive( 'appContainer', appContainerDrct );
})();