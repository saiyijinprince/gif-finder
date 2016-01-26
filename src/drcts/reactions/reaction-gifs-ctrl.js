/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function reactionGifsCtrl( $scope, $state ) {
        $scope.settings = {};
    };
    angular.module( 'gif-finder').controller( 'reactionGifsCtrl', reactionGifsCtrl );
})();