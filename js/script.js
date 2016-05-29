// Import tax calculator.
// (c) aureljared, 2016.
// GPLv3

var rates = {}, entered = {
	costGoods: 0,
	rateDuty: 0,
	wharfage: 0,
	freightCost: 0,
	bankCharge: 0,
	insurance: 0,
	brokerageFee: 0,
	other: 0,
	arrastre: 0,
	rate: 0
};

$(document).ready(function(){
	// Populate exchange rates
	var count = 0;
	var populate = function(el){
		var item = $(el).children().first(),
			attr = $(item).attr('id'), curr = attr.toUpperCase(),
			source = "http://api.fixer.io/latest?base=" + curr;

		$.get(source, function(data, status){
			var d = JSON.parse(JSON.stringify(data));
			var ex = {
				rate: d.rates["PHP"],
				date: d.date
			};

			$(item).children().first().text(ex.rate);
			rates[curr] = ex.rate;
			rates.date = ex.rate;

			if (curr == "USD") {
				$('#currency span').text(ex.rate);
				entered.rate = ex.rate;
			}

			count++;
			if (count == 3) {
				$('input').each(function(){
					$(this).removeAttr('disabled');
				});
			}
		});
	};
	$('li').each(function(){
		populate(this);
		$(this).click(function(){
			changeRate($(this).children().first().attr('id'));
		});
	});

	$('input').each(function(){
		$(this).change(function(){
			var key = $(this).attr('data-entry'),
				value = Number($(this).val());
			entered[key] = value;
			compute();
		});
	});

	var changeRate = function(base) {
		entered.rate = rates[base.toUpperCase()];
		$('#currency').html(base.toUpperCase() + ' <strong><span>' + entered.rate + '</span></strong>');
		compute();

		$('.currency-sign').each(function(){
			$(this).text(base.toUpperCase());
		});
	};

	var compute = function() {
		var d = entered;

		// Dutiable value
		var dutiableValue = (d.costGoods + d.freightCost + d.insurance + d.other) * d.rate;

		// Customs duty
		var customsDuty = dutiableValue * d.rateDuty;

		// Customs documentary stamp
		var cds = 265;

		// Import processing fee
		if (dutiableValue <= 250000)
			var ipf = 250;
		else if (dutiableValue <= 500000)
			var ipf = 500;
		else if (dutiableValue <= 750000)
			var ipf = 750;
		else
			var ipf = 1000;
		$('#ipf').text(ipf);

		// Total landed cost
		var tlc = dutiableValue + d.bankCharge + customsDuty + d.brokerageFee + d.arrastre + d.wharfage;

		// Value added tax
		var vat = tlc * 0.12;

		// Total
		var total = tlc + vat;
		$('#total strong').text(total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	};
});