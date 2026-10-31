import { readFile } from "node:fs/promises";
import path from "node:path";

const summaryPath = path.resolve("coverage/coverage-summary.json");

let summary;
try {
	summary = JSON.parse(await readFile(summaryPath, "utf8"));
} catch {
	console.log(`Coverage summary not found: ${summaryPath}`);
	process.exit(0);
}

const metrics = [
	["Statements", "statements"],
	["Branches", "branches"],
	["Functions", "functions"],
	["Lines", "lines"],
];

console.log("### Frontend coverage\n");
console.log("| Metric | Covered | Total | Coverage |");
console.log("| --- | ---: | ---: | ---: |");

for (const [label, key] of metrics) {
	const metric = summary.total?.[key];
	if (!metric) {
		continue;
	}
	console.log(
		`| ${label} | ${metric.covered} | ${metric.total} | ${metric.pct.toFixed(1)}% |`,
	);
}
