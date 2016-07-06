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
      var headerList = $document[0].body.querySelectorAll('.bar-header');
      var headerHeight = headerList[0].offsetHeight;
      
      function onScroll(e) {
        var scrollTop = e.target.scrollTop;

        if(scrollTop >= 0) {
          y = Math.min(headerHeight / scrollDelay, Math.max(0, y + scrollTop - prevY));
        } else {
          y = 0;
        }
        console.log(scrollTop);

        ionic.requestAnimationFrame(function() {
          fadeAmt = 1 - (y / headerHeight);
          headerList.forEach(function(header){
            header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + -y + 'px, 0)';
            for(var i = 0, j = header.children.length; i < j; i++) {
              header.children[i].style.opacity = fadeAmt;
            }
          });
          if(content.style.top === undefined || content.style.top === '') {
            content.style.top = window.getComputedStyle(content).getPropertyValue('top');
          }
          if(parseInt(content.style.top, 10) > 0) {
            content.style.top = parseInt(content.style.top, 10) + -y + 'px';
            console.log('top: '+content.style.top);
          } else {
            content.style.top = '0px';
          }
            
        });

        prevY = scrollTop;
      }

      $element.bind('scroll', onScroll);
    }
  }
})