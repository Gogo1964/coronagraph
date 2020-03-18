#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const htmlp = require('node-html-parser');

https.get('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
	let root = htmlp.parse(data);
	let main = root.querySelector("#main");
	let tsmsg = main.querySelectorAll("p")[1].childNodes[0].rawText;
	let ts = tsmsg.substring(7);
	let csv = main.querySelectorAll("p")[1].childNodes[0].rawText + "\n";
	main.querySelector("tbody").querySelectorAll("tr").forEach(elem => {
		let cols = elem.querySelectorAll("td");
		let line = "";
		for (var ci = 0; ci < 5; ci++) {
			let datanode = cols[ci].childNodes[0];
			if (datanode != null && datanode.rawText != null)
				line += datanode.rawText + ";";
			else 
				line += ";";		
		};
		csv += line.substring(0, line.length - 1) + "\n";
	});
	console.log(csv);
    let fn = "./raw_" + ts + ".html";
    fs.writeFile(fn, data, function(err) {
	    if(err) {
    	    return console.log(err);
    	}
    	console.log("Raw html written to file " + fn + "!");
	}); 
	let fncsv = "./data_" + ts + ".csv";
	fs.writeFile(fncsv, csv, function(err) {
	    if(err) {
    	    return console.log(err);
    	}
    	console.log("CSV data written to file " + fncsv + "!");
	});
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
}