/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const SYNONYMOUS_COMMAND = {
    name: 'synonyms',
    description: 'A command to get synonyms of users messages',
    options: [{
        type: 3,
        name: 'prompt',
        description: 'Your prompt here',
        required: true,
    }],
    type: 1,
}

export const ANTONYMOUS_COMMAND = {
    name: 'antonyms',
    description: 'A command to get antonyms of users messages',
    options: [{
        type: 3,
        name: 'prompt',
        description: 'Your prompt here',
        required: true,
    }],
    type: 1,
}