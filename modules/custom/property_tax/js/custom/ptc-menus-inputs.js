
// PTC sidebar navigation for sections

jQuery(document).on('click', '#block-centersections a.active-trail', function (e) {

    e.preventDefault();
    jQuery(this).closest("ul").toggleClass("expanded");

});


jQuery(document).on('load', '.cities-list', function () {

    console.log("here");  
    jQuery('.cities-list').chosen();

});

jQuery(".ptc-section-container div.views-col").on('click', function() {
    window.location = jQuery(this).find("a").attr("href"); 
    console.log("here");
    return false;
  });