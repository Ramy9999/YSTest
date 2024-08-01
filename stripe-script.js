// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51PYccEFKwE9UEqMhevP6Pv0HlXE03xtElgQ9rtBrwJn3qGnBhRYFnnoglExwbRxFX10c7Pb3CPCFXtzybGyn7vMv00fGEDlPjP');
const elements = stripe.elements();

// Custom styling for the Stripe Element
const style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            // color: '#aab7c4'
			color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

// Create an instance of the card Element
const card = elements.create('card', { style: style });

// Add the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element
card.on('change', ({ error }) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// Handle form submission
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const cardholderName = document.getElementById('cardholder-name').value;

    if (!cardholderName) {
        document.getElementById('card-errors').textContent = 'Please enter your full name.';
        return;
    }

    const { token, error } = await stripe.createToken(card, {
        name: cardholderName,
    });

    if (error) {
        // Inform the user if there was an error
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
    } else {
        // Send the token to your server
        stripeTokenHandler(token);
    }
});

// Submit the token and other form data to your server
function stripeTokenHandler(token) {
    const form = document.getElementById('payment-form');
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    // Also include the cardholder name in the form
    const cardholderName = document.getElementById('cardholder-name').value;
    const hiddenNameInput = document.createElement('input');
    hiddenNameInput.setAttribute('type', 'hidden');
    hiddenNameInput.setAttribute('name', 'cardholderName');
    hiddenNameInput.setAttribute('value', cardholderName);
    form.appendChild(hiddenNameInput);

    // Submit the form
    form.submit();
}