

jQuery(document).on('click', 'a.active-trail', function (e) {

    e.preventDefault();
    jQuery(".menu--center-sections li.active ~ li").addClass("nonactive");

});