/** @type {import('@playwright/test').PlaywrightTestConfig} */
let config = {
	webServer: {
		command: 'npm run test:preview',
		port: 5173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

if (!process.env.CI) {
	delete config.webServer.port;
	config.webServer.url = 'http://host:5173';
	config.use = { baseURL: config.webServer.url };
	config.webServer.reuseExistingServer = true;
}

export default config;
