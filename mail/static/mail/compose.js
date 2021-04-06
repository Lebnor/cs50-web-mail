document.addEventListener('DOMContentLoaded', function() {

    // uses api to send the mail when the form is submitted
    document.querySelector('#compose-form').addEventListener('submit', function() {

        let recipients = document.getElementById('compose-recipients').value;
        let subject = document.getElementById('compose-subject').value;
        let body = document.getElementById('compose-body').value;

        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
          }).then(response => response.json())
          .then(result => {
              console.log(result);
          });
    });

});