function getPdfRows(dates, areas) {
    const rows = [];
    
    // Dates
    const dayOfMonth = [{
        text: "",
        rowSpan: 2,
    }];
    const dayOfWeek = [""];

    for (const date of dates) {
        dayOfMonth.push({
            style: "dateHeader",
            text: toDisplayDate(date.date).replace(".", "\n"),
        });
        dayOfWeek.push({
            style: "dateHeader",
            text: toDayOfWeek(date.date),
        });
    }

    rows.push(dayOfMonth, dayOfWeek);

    // Shifts
    const colSpan = dates.length + 1;
    for (const area of areas) {
        rows.push([{
            colSpan,
            text: area.area,
            style: "timeHeader",
        }]);

        for (const time of area.times) {
            const row = [{
                text: time.time.replace(" - ", "-"),
            }];

            for (const date of dates) {
                const users = date.times[time.key] || [];

                if (!isWeekend(date.date))
                    row.push(users.join(", "));
                else {
                    row.push({
                        style: "weekend",
                        text: users.join(", "),
                    });
                }
            }

            rows.push(row);
        }
    }

    return rows;
}

function isEmptyRow(row) {
    for (const cell of row) {
        const text = cell.text || cell;
        if (text.length > 0)
            return false;
    }

    return true;
}

function createPdf(dates, areas) {
    // Header
    const content = [];
    
    // 2 weeks per table
    dates = dates.slice();
    while (dates.length) {
        const range = dates.splice(0, 7*4);
        const body = getPdfRows(range, areas)
            .filter(row => !isEmptyRow(row));
        
        const widths = ["auto"];
        for (const row of body) {
            while (widths.length < row.length) {
                widths.push("*");
            }
        }

        content.push({
            table: {
                body,
                widths,
                headerRows: 2,
                pageBreak: "after",
                style: "tableStyle",
                dontBreakRows: true,
            },
        });
    }

    pdfMake.createPdf({
        content,
        pageSize: "A4",
        pageOrientation: "landscape",
        styles: {
            header: {
                bold: true,
                fontSize: 10,
                margin: [0, 0, 0, 10]
            },
            tableStyle: {
                margin: [0, 5, 0, 15]
            },
            dateHeader: {
                bold: true,
            },
            timeHeader: {
                bold: true,
                noWrap: true,
                alignment: "left",
                fillColor: "#CCCCCC",
            },
            weekend: {
                fillColor: "#CCCCCC",
            },
        },
        defaultStyle: {
            fontSize: 8,
            alignment: "center",
        },
    }).download("shifts.pdf");
}