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
/*
const r = await generateWords('synonyms', 'good', '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')

console.log(r)*/