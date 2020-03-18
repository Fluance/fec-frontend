TabOpener.$inject = ['$window'];
function TabOpener($window) {

   var service = {
       openInNewTab: openInNewTab
   };

   return service;

   // ------------------------------------------------------

   /**
    * @ngdoc service
    * @name  TabOpener
    * @module blocks.tabOpener
    * @description
    *
    * This service opens a URL in a new tab/window.
    */
   function openInNewTab(url) {
       $window.open(url, '_blank');
   }

}

export default TabOpener;
