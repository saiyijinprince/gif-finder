/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function appContainerCtrl( $scope, $state ) {
        $scope.settings = {};
    };
    angular.module( 'gif-finder').controller( 'appContainerCtrl', appContainerCtrl );
})();