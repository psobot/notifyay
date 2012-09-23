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
