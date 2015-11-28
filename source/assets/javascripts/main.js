$(function() {
    // Smooth scrolling on menu anchor clicks
    $('#index-nav a').on('click', function(ev){
        // ev.preventDefault();
        // ev.stopPropagation();
        // $('html,body').animate({
        //     scrollTop: $($(this).attr('href')).offset().top - $('#index-nav').height() + 1
        // }, 1000);
    });
    
    // Resize
    $(window).bind("load resize", function() {
        // Resize main image
        $(window).load(function() {    
            var theWindow        = $(window),
                $bg              = $(".background"),
                aspectRatio      = $bg.width() / $bg.height();

            theWindow.resize(function(){
                if ( (theWindow.width() / theWindow.height()) < aspectRatio ) {
                    $bg.removeClass().addClass('background-height');
                } else {
                    $bg.removeClass().addClass('background-width');
                }
            });
            theWindow.trigger('resize');
        });
    });
    // $('#home,#hobbies').parallax("10%", 0.1);
});