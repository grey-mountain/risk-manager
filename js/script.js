let symbols = [];

const limit = 0.01 * 0.01
const market = 0.04 * 0.01

const prosadka = 6000
const trades = 20
const risk = prosadka / trades

function createAndFillTable() {

    const table = $("#stockTable");
    for (var i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        const row = $("<tr></tr>").appendTo(table);
        row.addClass("text-center sec_id");

        $("<td></td>").html(symbol.sec_id).appendTo(row);
        $("<td></td>").html(symbol.short_name).appendTo(row);
        $("<td></td>").html(symbol.prev_price).appendTo(row);
        $("<td></td>").html(symbol.lot_size).appendTo(row);
        $("<td></td>").html(symbol.min_step).appendTo(row);
        $("<td></td>").html(symbol.step_price).appendTo(row);

        const limit_comission = limit * symbol.prev_price * symbol.lot_size;
        $("<td></td>").html(parseFloat(limit_comission.toFixed(symbol.decimals + 2)) + " / " + Math.ceil(limit_comission / symbol.step_price) + " п.").appendTo(row);

        const market_comission = market * symbol.prev_price * symbol.lot_size;
        $("<td></td>").html(parseFloat(market_comission.toFixed(symbol.decimals + 2)) + " / " + Math.ceil(market_comission / symbol.step_price) + " п.").appendTo(row);

        $("<td></td>").append('<input type="text" class="form-control text-center">').appendTo(row);

        const ticker = symbol.sec_id;
        const stop = localStorage.getItem(ticker);
        const lot = risk / (symbol.step_price * stop + market_comission);


        $("<td></td>").addClass('half-lot').html(Math.ceil(lot * 0.5)).appendTo(row);
        $("<td></td>").addClass('full-lot').html(Math.ceil(lot)).appendTo(row);
        $("<td></td>").addClass('two-lot').html(Math.ceil(lot * 2)).appendTo(row);
        $("<td></td>").addClass('four-lot').html(Math.ceil(lot * 4)).appendTo(row);
        $("<td></td>").addClass('tenth-lot').html(Math.ceil(lot * 0.1)).appendTo(row);

    }

    $('#stockTable tbody tr').each(function() {
        var ticker = $(this).find('td:eq(0)').text();
        var savedValue = localStorage.getItem(ticker);
        $(this).find('input').val(savedValue);
    });
}

$.ajax({
    url: "https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json",
    method: "GET",
    success: function(response) {
        let records = response.securities.data;
        for (var i = 0; i < records.length; i++) {
            let record = records[i];
            let symbol = {
                sec_id: record[0],
                short_name: record[2],
                prev_price: record[3],
                lot_size: record[4],
                min_step: record[14],
                decimals: record[8],
                step_price: record[4] * record[14]
            };
            symbols.push(symbol);
        };
        createAndFillTable();
    }
});

$(document).ready(function() {
    $('#searchInput').on('keyup', function() {
        const searchText = $(this).val().toLowerCase();
        $('.sec_id').each(function() {
            var tickerText = $(this).find('td:first').text().toLowerCase();
            if (tickerText.includes(searchText)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    $('#stockTable').on('input', 'input', function() {
        var ticker = $(this).closest('tr').find('td:eq(0)').text();
        var value = $(this).val();
        localStorage.setItem(ticker, value);



        const $row = $(this).closest('tr');
        const stop = $(this).val();
        const symbol = symbols.find(s => s.sec_id == $row.find('td:eq(0)').text());
        const market_comission = market * symbol.prev_price * symbol.lot_size;
        const lot = risk / (symbol.step_price * stop + market_comission);

        $row.find('.half-lot').text(Math.ceil(lot * 0.5));
        $row.find('.full-lot').text(Math.ceil(lot));
        $row.find('.two-lot').text(Math.ceil(lot * 2));
        $row.find('.four-lot').text(Math.ceil(lot * 4));
        $row.find('.tenth-lot').text(Math.ceil(lot * 0.1));

        localStorage.setItem(symbol.sec_id, stop);
    });
});
