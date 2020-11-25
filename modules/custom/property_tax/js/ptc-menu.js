
jQuery(document).on('click', '#block-centersections a.active-trail', function (e) {

    e.preventDefault();
    jQuery(this).closest("ul").toggleClass("expanded");

});