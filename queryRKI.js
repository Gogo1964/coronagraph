#!/usr/bin/env node

const https = require('https');
const path = require('path');
const fs = require('fs');
const htmlp = require('node-html-parser');

var urlrki = 'https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html';
var dirraw = './raw/';
var dircsv = './csv/';

if (!fs.existsSync(dirraw)){
    fs.mkdirSync(dirraw);
}

if (!fs.existsSync(dircsv)){
    fs.mkdirSync(dircsv);
}

//joining path of directory 
const directoryPath = path.join(__dirname, dirraw);

console.log(directoryPath);

//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        console.log('Unable to scan directory: ' + err);
	} 
	else {
		//listing all files using forEach
		files.forEach(function (file) {
			if (file.endsWith('.html')) { 
				const csvo = convertHtmlToCsv(fs.readFileSync(path.join(directoryPath, file), 'utf-8'));
				console.log('TS = ' + csvo.ts);
				console.log('HEADLINE = ' + csvo.headline);
				writeCSV(csvo);
			}
		});
	}
});

https.get(urlrki, (resp) => {

  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
	const csvo = convertHtmlToCsv(data);
	console.log('TS = ' + csvo.ts);
	console.log('HEADLINE = ' + csvo.headline);
	console.log('CSV = ' + csvo.csv);
	writeCSV(csvo);

    let fn = dirraw + 'raw_' + csvo.ts + '.html';
    fs.writeFile(fn, data, function(err) {
	    if(err) {
    	    return console.log(err);
    	}
    	console.log('Raw html written to file ' + fn + '!');
	}); 
  });

}).on('error', (err) => {
  console.log('Error: ' + err.message);
});


function convertHtmlToCsv(htmlData) {
	let root = htmlp.parse(htmlData);
	let main = root.querySelector('#main');
	let psel = main.querySelectorAll('p');
	for (var pi = 0; pi < psel.length; pi++) {
		if (psel[pi].rawText.substring(0, 5) == 'Stand')
		{
			console.log(psel[pi].rawText);
			break;
		}
	}
	const result = {
		ts: psel[pi].rawText.substring(7),
		headline: psel[pi].rawText,
		csv: ''
	}
	main.querySelector('tbody').querySelectorAll('tr').forEach(elem => {
		let cols = elem.querySelectorAll('td');
		let line = '';
		for (var ci = 0; ci < 5; ci++) {
			let datanode = cols[ci].childNodes[0];
			if (datanode != null && datanode.rawText != null)
				line += datanode.rawText + ';';
			else 
				line += ';';		
		};
		result.csv += line.substring(0, line.length - 1) + '\n';
	});
	return result;
}

function writeCSV(csvo) {
	let fncsv = dircsv + 'data_' + csvo.ts + '.csv';
	fs.writeFile(fncsv, csvo.headline + '\n' + csvo.csv, function(err) {
	    if (err) {
    	    return console.log(err);
    	}
    	console.log('CSV data written to file ' + fncsv + '!');
	});
}

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
}