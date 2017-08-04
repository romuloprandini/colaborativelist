angular.module('ionic.ion.headerShrink', [])

.directive('headerShrink', function($document) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var starty = $scope.$eval($attr.headerShrink) || 0;
      var shrinkAmt;

      var amt;

      var y = 0;
      var prevY = 0;
      var scrollDelay = 0.4;

      var fadeAmt;
      var content = $element[0];
      content.style.top = '0px';
      content.style.paddingTop = '44px';
      var headerList = $document[0].body.querySelectorAll('.bar-header');
      var headerHeight = headerList[0].offsetHeight;
      
      function onScroll(e) {
        var scrollTop = e.target.scrollTop;

        if(scrollTop >= 0) {
          y = Math.min(headerHeight / scrollDelay, Math.max(0, y + scrollTop - prevY));
        } else {
          y = 0;
        }

        ionic.requestAnimationFrame(function() {
          fadeAmt = 1 - (y / headerHeight);
          for(var idx in headerList) {
              if(!headerList.hasOwnProperty(idx))
                continue;
            var header = headerList[idx];
            if(header.style !== undefined && header.style[ionic.CSS.TRANSFORM] !== undefined) {
              header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + -y + 'px, 0)';
            } else if(header.style !== undefined) {
              header.style.transform = 'translate3d(0, ' + -y + 'px, 0)';
            }
            for(var i = 0, j = header.children.length; i < j; i++) {
              header.children[i].style.opacity = fadeAmt;
            }
          }
        });

        prevY = scrollTop;
      }

      $element.bind('scroll', onScroll);
    }
  }
})