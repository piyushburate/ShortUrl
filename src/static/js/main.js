if(sessionStorage.sortLinkListBy == undefined){
    sessionStorage.sortLinkListBy = "datetime"
}
let path = null

function goTo(link, page) {
    window.history.pushState(null, null, link)
    router(page)
}

let router = async (page) => {
    path = (window.location.pathname).split("/")
    switch (path[1]) {
        case "user":
            if (page == "user") {
                $(".main").load("/static/page/user-" + path[3] + ".html")
                $(".menu").children().removeClass("active")
                $(".menuitem." + path[3]).addClass("active")
                $("#cancel_bg").trigger("click")
                document.title = "User " + path[3]
            } else {
                $("#app").load("/static/page/user.html")
            }
            break;
        case "login":
            $("#app").load("/static/page/login.html")
            document.title = "Login"
            break;
        case "signup":
            $("#app").load("/static/page/signup.html")
            document.title = "Signup"
            break;

        case "error":
        default:
            $("#app").load("/static/page/error.html")
            break;
    }
}

window.onpopstate = router

document.addEventListener("DOMContentLoaded", () => {
    $("body").on("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            goTo(e.target.href, e.target.getAttribute("data-link"))
        }
    })

    router()
})