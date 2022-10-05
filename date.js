
exports.getDate = function(){
    var data = new Date();

    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return data.toLocaleDateString("en-US", options);
};
