var makeRequest = async (url) => {
    var p = await fetch(url)
    var response = await p.json()
    return response
}

var makePostRequest = async (url, data) => {
    let p = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    let response = (await p).json()
    return response
}