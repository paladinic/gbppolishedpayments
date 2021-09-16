function create_payment_module(ns_prefix) {

  // Payment Intent (One-time Payment)
  Shiny.addCustomMessageHandler(
    ns_prefix + "create_payment_intent",
    function(message) {

      // COLLECT CARD DETAILS
      var stripe = Stripe(message.stripe_key);

      var elements = stripe.elements({
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
          },
        ],
        // Stripe's examples are localized to specific languages, but if
        // you wish to have Elements automatically detect your user's locale,
        // use `locale: 'auto'` instead.
        locale: 'auto'
        // locale: window.__exampleLocale
      });
      var cardElement = elements.create('card', {
        iconStyle: 'solid',
        style: {
          base: {
            iconColor: '#2491eb',
            color: '#000',
            fontWeight: 500,
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',

            ':-webkit-autofill': {
              color: '#fce883',
            },
            '::placeholder': {
              color: '#87BBFD',
            },
          },
          invalid: {
            iconColor: '#dd4b39',
            color: '#dd4b39',
          },
        },
      });
      cardElement.mount("#" + ns_prefix + "card_element");

      // CONFIRM Payment INTENT
      var cardholderName = document.getElementById(ns_prefix + "cardholder_name");
      var cardButton = document.getElementById(message.card_button_id);
      var clientSecret = message.client_secret;

      cardButton.addEventListener("click", function(ev) {

        // TODO: Allow saved cards (after removing `is.na(default_payment_method)`) checks in R

        // var attachPaymentMethod = document.getElementById(ns_prefix + "attach_payment_method").checked;
        // var hold_future_usage;
        // if (attachPaymentMethod) {
        //   hold_future_usage = "on_session";
        // } else {
        //   hold_future_usage = null;
        // }

        stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: cardholderName.value,
              },
            },
            //setup_future_usage: hold_future_usage
          }
        ).then(function(result) {

          if (result.error) {

            // Display error.message in your UI.
            toastr.error(result.error.message)
            LoadingButtons.resetLoading(message.card_button_id)
            console.error(result.error)

          } else {
            toastr.success("Payment completed successfully")
          }

          // send the result back to Shiny
          Shiny.setInputValue(ns_prefix + "payment_intent_result", result, { priority: "event"});

        });
      });


    }
  );
}
