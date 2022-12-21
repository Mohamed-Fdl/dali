# FdlBot

This project is about my discord bot I created to get antonyms and synonyms of words

[Demo of app](https://discord.gg/dR63hjzX)


## Project structure
Below is a basic overview of the project structure:

```

├── src
│   ├── commands.js           -> JSON payloads for commands
│   ├── openai.js             -> Interactions with the openai API
│   ├── register.js           -> Sets up commands with the Discord API
│   ├── server.js             -> Discord app logic and routing
├── test
|   ├── test.js               -> Tests for app
├── wrangler.toml             -> Configuration for Cloudflare workers
├── package.json
├── README.md
└── .gitignore
```

## .env file

I need to store somme credentials about the discord app & my openai API key.

The file look like this : 

```
APP_ID=
GUILD_ID=
DISCORD_TOKEN=
PUBLIC_KEY=

OPENAI_API_KEY=

```

## app.js

In this file I set up all services exported in other files & I put them together.

At the startup of the application,with HasGuildCommands I verify if commands : ANTONYMOUS_COMMAND & SYNONYMOUS_COMMAND are installed.If not,they are installed.


On my discord developers dashboard I set up the interaction URL to receive all interactions between my bot & users as webhooks.This URL is that 
/interactions .Requests comes via POST & contains all informations that I treat to send response back to Discord so that user can see it

Commands : /antonyms , /synonyms 



To generateWords (either synonyms or antonyms) I use the openai API which provide certains models of AI such as "text-davinci-003" that was developped to understand languages as human being.So it is this that I use to generates the antonyms & synonyms

```
export async function generateWords(type, prompt, apiKey) {

    const body = {
        model: "text-davinci-003",
        prompt: `Give me ${type} for the the following sentence : "${prompt}".Present them as list of unnumbered elements`,
        temperature: 0.5,
    }

    const response = await fetch('https://api.openai.com/v1/completions', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: JSON.stringify(body)
    });

    if (response.ok) {
        console.log('Datas comes from OPENAI');
    } else {
        console.error('Error !!');
        const text = await response.text();
        console.error(text);
    }
    const r = await response.json()
    return r.choices[0].text
}

```

## Conclusion

So that is how I create this simple discord bot.First throught the discord UI user use commands /antonyms or /synonyms and type a world.The discord bot get this and send it to open AI to get synonyms or antonyms .After the openAI API respond to my bot ,the bot send the response to the client