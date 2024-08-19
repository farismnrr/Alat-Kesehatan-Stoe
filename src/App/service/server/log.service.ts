const LogService = {
	ServerRequestLog(request: any) {
		request.plugins.startTime = process.hrtime();
	},

	ServerResponseLog(request: any, h: any) {
		const start = request.plugins.startTime;
		const end = process.hrtime(start);
		const responseTimeNs = end[0] * 1e9 + end[1];

		const method = request.method.toUpperCase();
		const paddedMethod = method.length < 6 ? method.padEnd(6, " ") : method;

		let responseTime;
		let unit;

		if (responseTimeNs < 1e3) {
			responseTime = responseTimeNs;
			unit = "ns";
		} else if (responseTimeNs < 1e6) {
			responseTime = responseTimeNs / 1e3;
			unit = "μs";
		} else if (responseTimeNs < 1e9) {
			responseTime = responseTimeNs / 1e6;
			unit = "ms";
		} else if (responseTimeNs < 1e12) {
			responseTime = responseTimeNs / 1e9;
			unit = "s";
		} else {
			responseTime = responseTimeNs / 1e12;
			unit = "Ms";
		}

		const response = request.response;
		const statusCode = response.isBoom ? response.output.statusCode : response.statusCode;

		console.log(
			`[ Bun - Hapi ] Code: ${statusCode} | Time: ${responseTime
				.toFixed()
				.padStart(3, " ")}${unit} | ${paddedMethod}\t${request.path}`
		);

		if (response.isBoom && response.output.statusCode === 404) {
			return h
				.response(
					`<!DOCTYPE html>
						<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>404 Not Found</title>
							<style>
								body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
								h1 { color: #ff6347; }
								p { font-size: 22px; }
							</style>
						</head>
						<body>
							<h1>404 Halaman tidak ditemukan</h1>
							<p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
						</body>
						</html>
					`
				)
				.code(404);
		}
	}
};

export default LogService;
