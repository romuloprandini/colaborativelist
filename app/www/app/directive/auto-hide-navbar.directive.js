(function() {
    'use strict';

    angular
        .module('colaborativelist.directive')
        .directive('autoHideNavbar', autoHideNavbar);

    autoHideNavbar.$inject = ['$document'];

    function autoHideNavbar($document) {
        var fadeAmt;
        var shrink = function(header, content, amt, max) {
            amt = Math.min(44, amt);
            fadeAmt = 1 - amt / 44;
            ionic.requestAnimationFrame(function() {
            header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + amt + 'px, 0)';
            for(var i = 0, j = header.children.length; i < j; i++) {
                header.children[i].style.opacity = fadeAmt;
            }
            });
        };
        
        var directive = {
                restrict: 'A',
                link: link
        }
        
        return directive;
        
    function link($scope, $element, $attr) {
      var starty = $scope.$eval($attr.headerShrink) || 0;
      var shrinkAmt;
      
      var header = $document[0].body.querySelector('.bar-header');
      var headerHeight = header.offsetHeight;
      
      $element.bind('scroll', function(e) {
        var scrollTop = null;
        if(e.detail){
          scrollTop = e.detail.scrollTop;
        }else if(e.target){
          scrollTop = e.target.scrollTop;
        }
        if(scrollTop > starty){
          // Start shrinking
          shrinkAmt = headerHeight - Math.max(0, (starty + headerHeight) - scrollTop);
          shrink(header, $element[0], shrinkAmt, headerHeight);
        } else {
          shrink(header, $element[0], 0, headerHeight);
        }
      });
    }
        /*function link(scope, elem, attr) {
            var status = false;
            if(!attr.status)
                return;
            var start = 0;
            var threshold = 150;
            
            elem.bind('scroll', function(e) {
            if(e.detail.scrollTop - start > threshold) {
                status = true;
            } else {
                status = false;
            }
            if (slideHeaderPrevious >= e.detail.scrollTop - start) {
                status = false;
            }
            slideHeaderPrevious = e.detail.scrollTop - start;
            scope[attr.status] = true;
            scope.$apply();
            });
        }*/
    }
})();