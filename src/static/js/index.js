if(sessionStorage.sortLinkListBy == undefined){
    sessionStorage.sortLinkListBy = "datetime"
}

let makeRequest = async (url) => {
    var p = await fetch(url)
    var response = await p.json()
    return response
}

let makePostRequest = async (url, data) => {
    let p = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    let response = await p.json()
    return response
}

let btnLoad = (btn, bool) => {
    $(btn).attr("disabled", bool)
    $(btn).toggleClass("loading-btn", bool)
}