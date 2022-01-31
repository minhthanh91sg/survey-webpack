const wc = require("./witness_calculator.js");

module.exports.generateWitness = async function (input) {
	const response = await fetch('/public/semaphore.wasm');
	console.log("the response",response);
	const buffer = await response.arrayBuffer();
	console.log("the buffer: ",buffer);
	let buff;
	console.log("Input after let buff", input);
	await wc(buffer).then(async witnessCalculator => {
		console.log("input inside async", input);
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});
	return buff;
}
