const Alexa = require('ask-sdk-core');
const rp = require('request-promise');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to inspirational quote!  You can ask for some inspirational quote.  It may be inspirational quote, but it may also be Spritual.';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('inspirational quote', speechText)
            .getResponse();
    },
};

const InspirationalQuoteIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "QuotesIntent"
        );
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            getQuote().then((response) => {
                resolve(handlerInput.responseBuilder
                    .speak(response)
                    .withSimpleCard('inspirational quote', response)
                    .getResponse());
            }).catch((error) => {
                resolve(handlerInput.responseBuilder.speak('This is not available at the moment.').getResponse());
            });
        });
    }
};


function getQuote() {
    return new Promise((resolve, reject) => {
        var options = {
            uri: 'http://api.adviceslip.com/advice',
            json: true
        };

        rp(options)
            .then(function (slip) {
                var advice = slip.slip.advice;
                console.log(advice);
                resolve(advice);
            })
            .catch(function (err) {
                console.log('ERR: ', err);
            });
    });
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {       
        var speechText = "What can I help you with?";
        var reprompt = "You can say please give me some Quotes or inspirational quotes.";

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(reprompt)
            .withSimpleCard('inspirational quote', speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('inspirational quote', speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.advice = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        InspirationalQuoteIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();