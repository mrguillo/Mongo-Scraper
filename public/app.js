// Wait to attach our handlers until the DOM is fully loaded.
$(function () {
    console.log("loaded!");
    $(document).ready(function () {
        console.log("ready!");
        // EVENT HANDLER -> Click function for "save" button
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
                $(".newscard[data-target=" + thisId + "]").hide();
            })
        });
        $(".saveNote").on("click", function () {
            event.preventDefault();
            console.log("save button clicked");
            let thisId = $(this).attr("data-id");
            let note = $(".noteText").val();
            console.log(thisId);
            console.log(note);
            $.ajax({
                method: "POST",
                url: "/notes/save/" + thisId,
                dataType: "text",
                data: {
                    name: note
                }
            }).then(function () {
                console.log("OK OK OK OK");
                thisID = "";
                note = "";
                $(".modalNote").modal("hide");
                window.location = "/saved"
            });
            // .done(function(data) {
            //     $(".noteText").val("");
            //     $(".modalNote").modal("hide");
            // window.location = "/saved"
        })
    });
    
    $(document).ready(function () {
        $(".dropdown-toggle").dropdown();
    });
});
 