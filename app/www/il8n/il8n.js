(function() {
    'use strict';    
    window.translation = {};
      
      var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", "il8n/languages/"+navigator.language.toLowerCase()+".js");
        document.getElementsByTagName("head")[0].appendChild(fileref);  
})();