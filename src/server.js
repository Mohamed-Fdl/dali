/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';

import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from 'discord-interactions';

import { SYNONYMOUS_COMMAND, ANTONYMOUS_COMMAND } from './commands.js';

import { generateWords } from './openai.js'

class JsonResponse extends Response {
    constructor(body, init) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
    return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async(request, env) => {
    const message = await request.json();
    console.log(message.data);
    if (message.type === InteractionType.PING) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        console.log('Handling Ping request');
        return new JsonResponse({
            type: InteractionResponseType.PONG,
        });
    }

    if (message.type === InteractionType.APPLICATION_COMMAND) {

        let prompt = message.data.options[0].value

        switch (message.data.name.toLowerCase()) {
            case SYNONYMOUS_COMMAND.name.toLowerCase():
                {
                    console.log('handling synonym request');

                    const r = await generateWords(SYNONYMOUS_COMMAND.name.toLowerCase(), prompt, env.OPENAI_API_KEY)

                    return new JsonResponse({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Response : ${r}`
                        },
                    });
                }
            case ANTONYMOUS_COMMAND.name.toLowerCase():
                {
                    console.log('handling antonym request');

                    const r = await generateWords(ANTONYMOUS_COMMAND.name.toLowerCase(), prompt, env.OPENAI_API_KEY)

                    return new JsonResponse({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Response : ${r}`
                        },
                    });
                }
            default:
                console.error('Unknown Command');
                return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
        }
    }

    console.error('Unknown Type');
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
    /**
     * Every request to a worker will start in the `fetch` method.
     * Verify the signature with the request, and dispatch to the router.
     * @param {*} request A Fetch Request object
     * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
     * @returns
     */
    async fetch(request, env) {
        if (request.method === 'POST') {
            // Using the incoming headers, verify this request actually came from discord.
            const signature = request.headers.get('x-signature-ed25519');
            const timestamp = request.headers.get('x-signature-timestamp');
            console.log(signature, timestamp, env.DISCORD_PUBLIC_KEY);
            const body = await request.clone().arrayBuffer();
            const isValidRequest = verifyKey(
                body,
                signature,
                timestamp,
                env.DISCORD_PUBLIC_KEY
            );
            if (!isValidRequest) {
                console.error('Invalid Request');
                return new Response('Bad request signature.', { status: 401 });
            }
        }

        // Dispatch the request to the appropriate route
        return router.handle(request, env);
    },
};