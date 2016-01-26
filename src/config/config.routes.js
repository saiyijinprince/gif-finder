/**
 * Created by akabeera on 1/25/2016.
 */
(function() {
    'use strict';

    function configRoutes( $stateProvider, $urlRouterProvider ) {
        $urlRouterProvider.otherwise( function() {
           return '/app/reactions';
        });

        var sharedState = {};

        $stateProvider
            .state( 'default', {
                abstract: true,
                template: '<app-container></app-container>',
                date: {
                    sharedState: sharedState
                }
            } )
            .state( 'default.reactions', {
                url: '/app/reactions',
                views: {
                    'header': { template: '<app-toolbar></app-toolbar>' },
                    'content@default': { template: '<reaction-gifs></reaction-gifs>' }
                }
            } );
    };
    angular.module( 'gif-finder').config( configRoutes );
})();