const { z } = require('zod');

const schema = z.string();
const result = schema.safeParse(123);

console.log('Success:', result.success);
if (!result.success) {
    console.log('Error type:', typeof result.error);
    console.log('Error keys:', Object.keys(result.error));
    console.log('Error content:', JSON.stringify(result.error, null, 2));

    // Check if .errors exists
    if (result.error.errors) {
        console.log('result.error.errors exists and is array:', Array.isArray(result.error.errors));
    } else {
        console.log('result.error.errors DOES NOT EXIST');
    }
}
