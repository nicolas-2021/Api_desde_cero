exports.jsonresponse = function(statuscode, body){
    return {
        statuscode,
        body
    };
}