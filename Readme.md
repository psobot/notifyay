# Notifyay
*/nɔ.ti.fje/, as in the French verb "notifier", or "to notify"*

by Peter Sobot (psobot.com) on September 22, 2012. Licensed under MIT.

---

Notifyay is a simple, email-based website uptime monitor. Add some URLs to a config file, set your email address and API key, and you'll know as soon as your website goes down - and when it comes back up.

Inspired by the wonderful [wasitup.com](http://wasitup.com), which has since been taken offline due to capacity issues.

Requires a (free!) API key from [PostageApp](http://postageapp.com/) to send emails reliably.

---

##Installation

    git clone https://github.com/psobot/notifyay.git
    cd notifyay
    npm install
    vim config.example.json
    mv config.example.json config.json

To make sure everything will work properly:

    node notifyay.js

To daemonize and run forever:

    node notifyay.js start

To stop a running notifyay process:

    node notifyay.js stop

##Config File Example

    {
      //    Your API key here.  
      "postageapp_api_key": "YOUR_API_KEY_HERE",

      //    The interval (in seconds) between checks of every site.
      //    Note that if this is too small, you might hammer your
      //    site with GET or HEAD requests.
      "interval": 5,

      //    The sender and sender_domain attributes are combined
      //    as such to make the "From:" field:
      //    sender+<random>@sender_domain
      "sender": "YOUR_FROM_ADDRESS_NAME",
      "sender_domain": "YOUR_FROM_DOMAIN",

      //    An array of recepients for every email.
      "recipients": ["YOUR_TO_ADDRESSes_HERE"],

      //    URLs to check. This is an array of:
      //        URL: null or a string to find in the body of the response
      //    If null is provided as a value, a HEAD request will be made.
      //    Otherwise, a GET request will be made and the response 
      //    checked for the provided string.
      "urls": {
        "YOUR_URL_HERE": null,
        "YOUR_URL_HERE": "string_that_should_exist_in_GET_body",
      }
    }
