// server.js
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PYccEFKwE9UEqMhlYZx0EUpu7Y1A43JLrgd38ZPGi85cUkJFWdKuTACK1Xr63NgETTUca6XGsQJsYQvSMk0TX1c008QIrVtfV');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/charge', async (req, res) => {
    const token = req.body.stripeToken;

    try {
        const charge = await stripe.charges.create({
            amount: 499, // Amount in cents
            currency: 'cad',
            source: token,
            description: 'charge'
        });

        res.send('Success'); // Handle success scenario
    } catch (error) {
        res.status(500).send('Error'); // Handle error scenario
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});