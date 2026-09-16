/**
* PHP Email Form Validation - v3.11
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  const emailJsPublicKey = 'xIjaaVX8geAeCtF8l';
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: emailJsPublicKey });
  }

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    if (action === 'emailjs') {
      const serviceId = thisForm.dataset.emailjsService;
      const templateId = thisForm.dataset.emailjsTemplate;

      if (typeof emailjs === 'undefined' || !serviceId || !templateId) {
        displayError(thisForm, 'Email service is unavailable. Please try again later.');
        return;
      }

      emailjs.send(serviceId, templateId, {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        subject: formData.get('subject') || '',
        message: formData.get('message') || '',
        from_name: formData.get('name') || '',
        from_email: formData.get('email') || '',
        reply_to: formData.get('email') || ''
      })
        .then(() => {
          thisForm.querySelector('.loading').classList.remove('d-block');
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        })
        .catch((error) => {
          displayError(thisForm, error?.text || 'The message could not be sent. Please try again.');
        });
      return;
    }

    if (action.includes('formspree.io')) {
      const senderName = (formData.get('name') || 'New contact').toString().trim();
      const subject = (formData.get('subject') || 'Portfolio contact form submission').toString().trim();
      formData.set('_subject', `${senderName} - ${subject}`);
      formData.set('_replyto', formData.get('email') || '');
    }

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      if( response.ok ) {
        return response.text().then(text => ({ text, response }));
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(({ text, response }) => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      let data = text.trim();
      let isSuccessful = data === 'OK';

      if (response.url.includes('formspree.io') && data) {
        try {
          isSuccessful = JSON.parse(data).ok === true;
        } catch (error) {
          isSuccessful = false;
        }
      }

      if (isSuccessful) {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
