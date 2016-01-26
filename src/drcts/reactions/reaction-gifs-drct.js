/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function reactionGifsDrct( $window, $rootScope ) {
        return {
            restrict: 'E',
            templateUrl: 'drcts/reactions/templates/reaction-gifs.html',
            controller: 'reactionGifsCtrl'
        };
    };
    angular.module( 'gif-finder').directive( 'reactionGifs', reactionGifsDrct );
})();