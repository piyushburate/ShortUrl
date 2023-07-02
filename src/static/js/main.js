let router = async () => {
    let path = (window.location.pathname).split("/")
    // console.log(path);

    switch (path[1]) {
        case "user":
            $("#app").load("/static/page/user.html")
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

router()