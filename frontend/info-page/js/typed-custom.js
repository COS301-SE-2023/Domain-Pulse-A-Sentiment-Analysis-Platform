jQuery(document).ready(function() {
        $(function () {
// jquery typed plugin
    $(".typed").typed({
        stringsElement: $('.typed-strings'),
        typeSpeed: 200,
        backDelay: 1500,
        loop: true,
        contentType: 'html', // or text
        // defaults to false for infinite loop
        loopCount: false,
        callback: function () { null; },
        resetCallback: function () { newTyped(); }
    });
});
});