// Wait to attach our handlers until the DOM is fully loaded.
$(function() {
    console.log( "loaded!" );
    $(document).ready(function () {
        console.log("ready!");
        // Click function for "save" button
        $(".save-btn").on("click", function () {
            event.preventDefault();
            console.log("click");
            thisId = "";
            var thisId = $(this).attr("data-target");
            console.log(thisId);
            $.ajax({
                method: "GET",
                url: "/saved/" + thisId
            }).then(function () {
                // window.location = "/"
                $(".newscard[data-target=" + thisId +"]").hide();

            })
        });
    });
 });