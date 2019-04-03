const r = require("request");
const qs = require("querystring");
const ch = require("cheerio");


const scrumOrgBaseUrl = "https://scrum.org";
const scrumOrgSearchUrl = "https://www.scrum.org/certification-list-data";
const scrumOrgParams = {
    first_name: "",
    last_name: "",
    certification_name: "",
    page: 1,
    form_id: "scrumorg_assessments_certificate_holder_search_form"
};

scrumOrgParams.last_name = "?";
scrumOrgParams.first_name = "?";

r(scrumOrgSearchUrl + "?" + qs.stringify(scrumOrgParams), (err, response, body) => {
    if (err !== null && response.statusCode !== 200) {
        console.error(err + " " + body);
    }
    let bodyObj = JSON.parse(body);
    let $ = ch.load(bodyObj.markup);
    let rows = $("div.responsive-table-row:not(.responsive-table-headings)").map((i, e) => {
        let row = {};
        $(e).find("div.responsive-table-cell div.responsive-table-cell-interior strong.responsive-table-mobile-label").map((j, cell) => {
                let fieldName = $(cell).html().split(":")[0].toLowerCase();
                let fieldValue = "";
                if (fieldName === "name") {
                    fieldValue = $(cell).parent().find("a").html();
                    row.profile = $(cell).parent().find("a").attr("href");
                } else {
                    fieldValue = $(cell).parent().children().remove().end().text().replace(/\s+/g, '');
                }
                row[fieldName] = fieldValue;
            }
        );
        return row;
    }).get();
    let users = {};
    rows.forEach((row) => {
        if (!users.hasOwnProperty(row.profile)) {
            users[row.profile] = {
                name: row.name,
                url: scrumOrgBaseUrl + row.profile
            };
        }
        if (!users[row.profile].hasOwnProperty(row.certification)) {
            users[row.profile][row.certification] = [];
        }
        users[row.profile][row.certification].push({
           date: row.date,
           location: row.location
        });
    });
    console.log(JSON.stringify(users, null, 2));
});

