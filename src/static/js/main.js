let path = null

function goTo(link, page) {
    window.history.pushState(null, null, link)
    router(page)
}

let router = async (page) => {
    path = (window.location.pathname).split("/")
    switch (path[1]) {
        case "user":
            if (path.length == 3) goTo(window.location.pathname + "/overview")
            else if (path[3] == "") goTo(window.location.pathname + "overview")

            if (page == "user") {
                $(".main").load("/static/page/user-" + path[3] + ".html")
                $(".menu").children().removeClass("active")
                $(".menuitem." + path[3]).addClass("active")
                $(".cancel_bg").click()
            } else {
                $("#app").load("/static/page/user.html")
            }
            break;

        case "login":
            $("#app").load("/static/page/login.html")
            break;

        case "signup":
            $("#app").load("/static/page/signup.html")
            break;

        default:
            break;
    }
}

window.onpopstate = () => { router(null) }

document.addEventListener("DOMContentLoaded", () => {
    document.body.onclick = e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            goTo(e.target.href, null)
        }

        if (e.target.matches("[data-link-user]")) {
            e.preventDefault()
            goTo(e.target.href, "user")
        }
    }

    router(null)
})

