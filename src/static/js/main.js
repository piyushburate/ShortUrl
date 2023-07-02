let addRow = (id, name, email, pass) => {
    document.querySelector("table").innerHTML +=
        `<tr>
            <td>${id}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${pass}</td>
        </tr>`
}

let getData = async () => {
    var result = null
    fetch('/api/db/users')
        .then(response => response.text())
        .then(data => {
            var rows = JSON.parse(data)
            console.log(rows)
            rows.forEach(row => {
                addRow(row.uid, row.name, row.email, row.pass);
            });
        })
}

getData()