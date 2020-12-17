
// PTC sidebar navigation for sections

// jQuery(document).on('click', '#avgGenRevInput', function (e) {

//     console.log("here");
//     jQuery('#avgAllCitiesGenRev').toggleClass("hidden");
//     jQuery('#avgAllCitiesGenRev').toggleClass("showElement");

// });


// To printo modal
jQuery('#btnPrint').on('click', function() {
    printElement(document.getElementById("printThis"));
    
    //var modThis = document.querySelector("#printSection .modifyMe");
    //modThis.appendChild(document.createTextNode(" new"));
    
    window.print();
});

function printElement(elem) {
    var domClone = elem.cloneNode(true);
    
    var $printSection = document.getElementById("printSection");
    
    if (!$printSection) {
        var $printSection = document.createElement("div");
        $printSection.id = "printSection";
        document.body.appendChild($printSection);
    }
    
    $printSection.innerHTML = "";
    
    $printSection.appendChild(domClone);
}