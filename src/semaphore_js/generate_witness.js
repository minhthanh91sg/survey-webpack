const wc = require("./witness_calculator.js");

module.exports.generateWitness = async function (input) {
	const response = await fetch('/public/semaphore.wasm');
	console.log("the response",response);
	const buffer = await response.arrayBuffer();
	console.log("the buffer: ",buffer);
	let buff;
	await wc(buffer).then(async witnessCalculator => {
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});
	return buff;
}
