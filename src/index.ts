import express from 'express';

const app = express()

app.use('/', (request, response) => {
    console.log('Root route hit');

    response.send("Hello, class!");
});

app.listen(3001, () => {
    console.log('Server listening on port 3000');
})