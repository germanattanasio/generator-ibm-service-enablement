'use strict';
const path = require('path');
const yassert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');
const optionsBluemix = Object.assign({}, require('./resources/bluemix.json'));
const optionsStarter = {};

const GENERATOR_PATH = '../generators/app/index.js';
const PACKAGE_JSON = 'package.json';
const SERVER_MAPPINGS_JSON = 'server/config/mappings.json';
const SERVER_LOCALDEV_CONFIG_JSON = 'server/localdev-config.json';

describe('node-express', function () {
	this.timeout(10 * 1000); // 10 seconds, Travis might be slow

	before(() => {
		optionsBluemix.backendPlatform = "NODE";
		optionsStarter.applicationType = "WEB";
		return helpers
			.run(path.join(__dirname, GENERATOR_PATH))
			.inTmpDir()
			.withOptions({
				bluemix: JSON.stringify(optionsBluemix),
				starter: JSON.stringify(optionsStarter)
			})
			.then((tmpDir) => {
				console.info("tmpDir", tmpDir);
			});
	});

	it('Can run successful generation and create files', () => {
		yassert.file(PACKAGE_JSON);
		yassert.file('.gitignore');
		yassert.file('server');
		yassert.file('server/config');
		yassert.file(SERVER_MAPPINGS_JSON);
		yassert.file('server/services');
		yassert.file('server/services/index.js');
		yassert.file('server/services/service-manager.js');
		yassert.file(SERVER_LOCALDEV_CONFIG_JSON);
		yassert.fileContent('.gitignore', SERVER_LOCALDEV_CONFIG_JSON);
	});

	it('Can add Apache Spark instrumentation', () => {
		testAll('apache-spark', {
			apache_spark_cluster_master_url: optionsBluemix.apacheSpark.cluster_master_url,
			apache_spark_tenant_id: optionsBluemix.apacheSpark.tenant_id,
			apache_spark_tenant_secret: optionsBluemix.apacheSpark.tenant_secret
		});
	});

	it('Can add AppID/Auth instrumentation', () => {
		testAll('appid', {
			appid_tenantId: optionsBluemix.appid.tenantId,
			appid_clientId: optionsBluemix.appid.clientId,
			appid_secret: optionsBluemix.appid.secret,
			appid_oauthServerUrl: optionsBluemix.appid.oauthServerUrl,
			appid_profilesUrl: optionsBluemix.appid.profilesUrl
		});
	});

	it('Can add Cloudant instrumentation', () => {
		testAll('cloudant', {
			cloudant_username: optionsBluemix.cloudant[0].username,
			cloudant_password: optionsBluemix.cloudant[0].password,
			cloudant_url: optionsBluemix.cloudant[0].url
		});
	});

	it('Can add Cloud Object Storage instrumentation', () => {
		testAll('cloud-object-storage', {
			cloud_object_storage_apikey: optionsBluemix.cloudObjectStorage.apikey,
			cloud_object_storage_endpoints: optionsBluemix.cloudObjectStorage.endpoints,
			cloud_object_storage_iam_apikey_description: optionsBluemix.cloudObjectStorage.iam_apikey_description,
			cloud_object_storage_iam_apikey_name: optionsBluemix.cloudObjectStorage.iam_apikey_name,
			cloud_object_storage_iam_role_crn: optionsBluemix.cloudObjectStorage.iam_role_crn,
			cloud_object_storage_iam_serviceid_crn: optionsBluemix.cloudObjectStorage.iam_serviceid_crn,
			cloud_object_storage_resource_instance_id: optionsBluemix.cloudObjectStorage.resource_instance_id
		})
	})

	it('Can add ObjectStorage instrumentation', () => {
		testAll('object-storage', {
			object_storage_projectId: optionsBluemix.objectStorage[0].projectId,
			object_storage_userId: optionsBluemix.objectStorage[0].userId,
			object_storage_password: optionsBluemix.objectStorage[0].password,
			object_storage_region: optionsBluemix.objectStorage[0].region
		});
	});

	it('Can add DashDB instrumentation', () => {
		testAll('dashdb', {
			dashdb_dsn: optionsBluemix.dashDb.dsn,
			dashdb_jdbcurl: optionsBluemix.dashDb.jdbcurl
		});
	});

	it('Can add DB2 instrumentation', () => {
		testAll('db2', {
			db2_dsn: optionsBluemix.db2OnCloud.dsn,
			db2_ssljdbcurl: optionsBluemix.db2OnCloud.ssljdbcurl
		});
	});

	it('Can add Finance - Historical Instrument Analytics instrumentation', () => {
		testAll('finance-simulated-historical-instrument-analytics', {
			finance_historical_instrument_analytics_uri: optionsBluemix.historicalInstrumentAnalytics.uri,
			finance_historical_instrument_analytics_accessToken: optionsBluemix.historicalInstrumentAnalytics.accessToken
		});

	});

	it('Can add Finance - Instrument Analytics instrumentation', () => {
		testAll('finance-instrument-analytics', {
			finance_instrument_analytics_uri: optionsBluemix.instrumentAnalytics.uri,
			finance_instrument_analytics_accessToken: optionsBluemix.instrumentAnalytics.accessToken
		});
	});

	it('Can add Finance - Investment Portfolio instrumentation', () => {
		testAll('finance-investment-portfolio', {
			finance_investment_portfolio_url: optionsBluemix.investmentPortfolio.url,
			finance_investment_portfolio_writer_userid: optionsBluemix.investmentPortfolio.writer.userid,
			finance_investment_portfolio_writer_password: optionsBluemix.investmentPortfolio.writer.password,
			finance_investment_portfolio_reader_userid: optionsBluemix.investmentPortfolio.reader.userid,
			finance_investment_portfolio_reader_password: optionsBluemix.investmentPortfolio.reader.password
		});
	});

	it('Can add Finance - Predictive Market Scenarios instrumentation', () => {
		testAll('finance-predictive-market-scenarios', {
			finance_predictive_market_scenarios_uri: optionsBluemix.predictiveMarketScenarios.uri,
			finance_predictive_market_scenarios_accessToken: optionsBluemix.predictiveMarketScenarios.accessToken
		});
	});

	it('Can add Finance - Simulated Historical Instrument Analytics instrumentation', () => {
		testAll('finance-historical-instrument-analytics', {
			finance_simulated_historical_instrument_analytics_uri: optionsBluemix.simulatedHistoricalInstrumentAnalytics.uri,
			finance_simulated_historical_instrument_analytics_accessToken: optionsBluemix.simulatedHistoricalInstrumentAnalytics.accessToken
		});
	});

	it('Can add Finance - Simulated Instrument Analytics instrumentation', () => {
		testAll('finance-simulated-instrument-analytics', {
			finance_simulated_instrument_analytics_uri: optionsBluemix.simulatedInstrumentAnalytics.uri,
			finance_simulated_instrument_analytics_accessToken: optionsBluemix.simulatedInstrumentAnalytics.accessToken
		});
	});

	it('Can add Watson - Conversation instrumentation', () => {
		testAll('watson-conversation', {
			watson_conversation_url: optionsBluemix.conversation.url,
			watson_conversation_username: optionsBluemix.conversation.username,
			watson_conversation_password: optionsBluemix.conversation.password
		});
	});

	it('Can add Watson - Discovery instrumentation', () => {
		testAll('watson-discovery', {
			watson_discovery_url: optionsBluemix.discovery.url,
			watson_discovery_username: optionsBluemix.discovery.username,
			watson_discovery_password: optionsBluemix.discovery.password
		});
	});

	it('Can add Watson - Language Translator instrumentation', () => {
		testAll('watson-language-translator', {
			watson_language_translator_url: optionsBluemix.languageTranslator.url,
			watson_language_translator_username: optionsBluemix.languageTranslator.username,
			watson_language_translator_password: optionsBluemix.languageTranslator.password
		});
	});

	it('Can add Watson - Natural Language Classifier instrumentation', () => {
		testAll('watson-natural-language-classifier', {
			watson_natural_language_classifier_url: optionsBluemix.naturalLanguageClassifier.url,
			watson_natural_language_classifier_username: optionsBluemix.naturalLanguageClassifier.username,
			watson_natural_language_classifier_password: optionsBluemix.naturalLanguageClassifier.password
		});
	});

	it('Can add Watson - Natural Language Understanding instrumentation', () => {
		testAll('watson-natural-language-understanding', {
			watson_natural_language_understanding_url: optionsBluemix.naturalLanguageUnderstanding.url,
			watson_natural_language_understanding_username: optionsBluemix.naturalLanguageUnderstanding.username,
			watson_natural_language_understanding_password: optionsBluemix.naturalLanguageUnderstanding.password
		});
	});

	it('Can add Watson - Personality Insights instrumentation', () => {
		testAll('watson-personality-insights', {
			watson_personality_insights_url: optionsBluemix.personalityInsights.url,
			watson_personality_insights_username: optionsBluemix.personalityInsights.username,
			watson_personality_insights_password: optionsBluemix.personalityInsights.password
		});
	});

	it('Can add Watson - Speech-to-Text instrumentation', () => {
		testAll('watson-speech-to-text', {
			watson_speech_to_text_url: optionsBluemix.speechToText.url,
			watson_speech_to_text_username: optionsBluemix.speechToText.username,
			watson_speech_to_text_password: optionsBluemix.speechToText.password,
		});
	});

	it('Can add Watson - Text-to-Speech instrumentation', () => {
		testAll('watson-text-to-speech', {
			watson_text_to_speech_url: optionsBluemix.textToSpeech.url,
			watson_text_to_speech_username: optionsBluemix.textToSpeech.username,
			watson_text_to_speech_password: optionsBluemix.textToSpeech.password,
		});
	});

	it('Can add Watson - Tone Analyzer instrumentation', () => {
		testAll('watson-tone-analyzer', {
			watson_tone_analyzer_url: optionsBluemix.toneAnalyzer.url,
			watson_tone_analyzer_username: optionsBluemix.toneAnalyzer.username,
			watson_tone_analyzer_password: optionsBluemix.toneAnalyzer.password,
		});
	});

	it('Can add Watson - Visual Recognition instrumentation', () => {
		testAll('watson-visual-recognition', {
			watson_visual_recognition_url: optionsBluemix.visualRecognition.url,
			watson_visual_recognition_apikey: optionsBluemix.visualRecognition.apikey
		});
	});

	it('Can add Weather Insights  instrumentation', () => {
		testAll('weather-company-data', {
			weather_company_data_url: optionsBluemix.weatherInsights.url,
			weather_company_data_username: optionsBluemix.weatherInsights.username,
			weather_company_data_password: optionsBluemix.weatherInsights.password
		});
	});

	it('Can add Push instrumentation', () => {
		testAll('push', {
			push_appGuid: optionsBluemix.push.appGuid,
			push_apikey: optionsBluemix.push.apikey,
			push_clientSecret: optionsBluemix.push.clientSecret
		});

	});

	it('Can add AlertNotification instrumentation', () => {
		testAll('alert-notification', {
			alert_notification_url: optionsBluemix.alertNotification.url,
			alert_notification_name: optionsBluemix.alertNotification.name,
			alert_notification_password: optionsBluemix.alertNotification.password
		});
	});


	it('Can add MongoDB instrumentation', () => {
		testAll('mongodb', {
			mongodb_uri: optionsBluemix.mongodb.uri
		});
	});

	it('Can add Redis instrumentation', () => {
		testAll('redis', {
			redis_uri: optionsBluemix.redis.uri
		});
	});

	it('Can add Postgre instrumentation', () => {
		testAll('postgre', {
			postgre_uri: optionsBluemix.postgresql.uri
		});
	});

	it('Does not add AppID instrumentation when application type is a microservice', (done) => {

		optionsStarter.applicationType = "MS";
		helpers
			.run(path.join(__dirname, GENERATOR_PATH))
			.inTmpDir()
			.withOptions({
				bluemix: JSON.stringify(optionsBluemix),
				starter: JSON.stringify(optionsStarter)
			})
			.then((tmpDir) => {
				console.info(tmpDir);

				testNonWebNode('appid', {
					appid_tenantId: optionsBluemix.appid.tenantId,
					appid_clientId: optionsBluemix.appid.clientId,
					appid_secret: optionsBluemix.appid.secret,
					appid_oauthServerUrl: optionsBluemix.appid.oauthServerUrl,
					appid_profilesUrl: optionsBluemix.appid.profilesUrl
				});

				done();
			});
	});

	it('Does not add AppID instrumentation when starter option is missing', (done) => {

		helpers
			.run(path.join(__dirname, GENERATOR_PATH))
			.inTmpDir()
			.withOptions({
				bluemix: JSON.stringify(optionsBluemix),
			})
			.then((tmpDir) => {
				console.info(tmpDir);

				testNonWebNode('appid', {
					appid_tenantId: optionsBluemix.appid.tenantId,
					appid_clientId: optionsBluemix.appid.clientId,
					appid_secret: optionsBluemix.appid.secret,
					appid_oauthServerUrl: optionsBluemix.appid.oauthServerUrl,
					appid_profilesUrl: optionsBluemix.appid.profilesUrl
				});

				done();
			});
	});


	it('Can run generation with no services', (done) => {
		for (let key in optionsBluemix) {
			if (key !== 'name' && key !== 'backendPlatform' && key !== 'server') {
				delete optionsBluemix[key];
			}
		}

		helpers
			.run(path.join(__dirname, GENERATOR_PATH))
			.inTmpDir()
			.withOptions({
				bluemix: JSON.stringify(optionsBluemix)
			})
			.then((tmpDir) => {
				console.info(tmpDir);

				// package.json doesn't have any SDKs
				yassert.noFileContent(PACKAGE_JSON, 'appid');
				yassert.noFileContent(PACKAGE_JSON, 'cloudant');
				yassert.noFileContent(PACKAGE_JSON, 'dashdb');
				yassert.noFileContent(PACKAGE_JSON, 'watson-developer-cloud');

				yassert.noFile(SERVER_LOCALDEV_CONFIG_JSON);

				done();
			});
	})
});

// Node projects that are NOT Web projects do not have appid deps,
// readme or instrumentation, but do have localdev-config
function testNonWebNode(serviceName, localDevConfigJson) {
	testNoServiceDependencies();
	testNoServiceInstrumentation(serviceName);
	testNoReadMe(serviceName);

	testLocalDevConfig(localDevConfigJson || {});
}

function testNoServiceInstrumentation(serviceName) {
	const expectedRequire = `require('./service-${serviceName}')(app, serviceManager);`;
	yassert.noFileContent('server/services/index.js', expectedRequire);
	yassert.noFile(`server/services/service-${serviceName}.js`);
}

function testAll(serviceName, localDevConfigJson) {
	testServiceDependencies(serviceName);
	testServiceInstrumentation(serviceName);
	testReadMe(serviceName);
	testLocalDevConfig(localDevConfigJson || {});
}

function testServiceDependencies(serviceName) {
	const filePath = path.join(__dirname, "..", "generators", `service-${serviceName}`, "templates", "node", "dependencies.json");
	const expectedDependencies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	yassert.jsonFileContent(PACKAGE_JSON, expectedDependencies);
}

function testNoServiceDependencies() {
	yassert.noFileContent(PACKAGE_JSON, "appid");
}

function testServiceInstrumentation(serviceName) {
	const expectedRequire = `require('./service-${serviceName}')(app, serviceManager);`;
	yassert.fileContent('server/services/index.js', expectedRequire);
	yassert.file(`server/services/service-${serviceName}.js`);

	const filePath = path.join(__dirname, "..", "generators", `service-${serviceName}`, "templates", "node", "instrumentation.js");
	const expectedInstrumentation = fs.readFileSync(filePath, 'utf-8');
	yassert.fileContent(`server/services/service-${serviceName}.js`, expectedInstrumentation);
}


function testReadMe(serviceName) {
	yassert.file(`docs/services/service-${serviceName}.md`);
	const filePath = path.join(__dirname, "..", "generators", `service-${serviceName}`, "templates", "node", "README.md");
	const expectedReadme = fs.readFileSync(filePath, 'utf-8');
	yassert.fileContent(`docs/services/service-${serviceName}.md`, expectedReadme);
}

function testNoReadMe(serviceName) {
	yassert.noFile(`docs/services/service-${serviceName}.md`);
}

function testLocalDevConfig(json) {
	yassert.jsonFileContent(SERVER_LOCALDEV_CONFIG_JSON, json);
}
