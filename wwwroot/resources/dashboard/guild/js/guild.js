let rolesToRemove = {};
let membersToKick = [];

$("button[id^=\"removeRole-\"").click(function()
{
    let memberId = $(this).prop("id").split("-")[1];
    let roleId = $(this).prop("id").split("-")[2];

    $(`span[name="${memberId}-${roleId}"]`).remove();

    if (rolesToRemove.hasOwnProperty(memberId)) rolesToRemove[memberId].push(roleId);
    else rolesToRemove[memberId] = [roleId];
});

$("input[type=\"checkbox\"]").change(function()
{
    let memberId = $(this).prop("id").split("-")[1];

    if (this.checked) {
        membersToKick.push(memberId);
        $(`#${memberId}`).addClass("table-danger");
    }
    else {
        membersToKick.splice(membersToKick.indexOf(memberId), 1);
        $(`#${memberId}`).removeClass("table-danger");
    }
});

$("a[role=\"tab\"]").click(function()
{
    $("a[role=\"tab\"]").each(function()
    {
        $(this).removeClass("active");
    });

    $(this).addClass("active");
});

$("#memberForm").submit(function(e)
{
    let formData = new FormData();

    formData.set("rolesToRemove", rolesToRemove);
    formData.set("membersToKick", membersToKick);

    $.ajax({
        url: $(location).attr("href"),
        data: formData,
        method: "POST",
        success: function() { location.reload(); },
        error: function() { alert("Something went horribly wrong :/ "); }
    });
    
    e.preventDefault();
});
