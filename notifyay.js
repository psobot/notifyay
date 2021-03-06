/*
 *  Notifyay (/nɔ.ti.fje/, as in the French verb "notifier", or "to notify")
 *  by Peter Sobot (psobot.com)
 *  September 22, 2012
 *
 *  A simple, email-based website uptime monitor.
 *  Requires an API key from PostageApp to send emails (http://postageapp.com/)
 */

var request = require("request"),
    fs      = require("fs"),
    url     = require('url');

var daemon = require("daemonize2").setup({
    main: "notifyay.js",
    name: "notifyay",
    pidfile: "notifyay.pid"
});

var run = function() {
  var _config_file = __dirname + '/config.json';
  var config = {};
  var postage;

  fs.readFile(_config_file, 'utf8', function (err, data) {
    if (err) {
      console.log("Could not open config file.")
      if (fs.existsSync(__dirname + "/config.example.json")) {
        console.log("Did you forget to rename your \"config.example.json\" to \"config.json\"?");
      } else {
        console.log(err);
      }
      return;
    }
    config = JSON.parse(data);
    postage = require("postageapp")(config.postageapp_api_key);
    
    config.sites = {};
    config.checks = {}
    for (_url in config.urls) {
      config.sites[_url] = true;
      config.checks[_url] = config.urls[_url];
    }
    console.log("Checking " + config.urls.length + " sites every " + config.interval + " minutes.");
    setInterval( check_sites, config.interval * 1000 * 60 );
    check_sites();
  });

  check_sites = function() {
    console.log("Starting check at " + new Date());
    for (site in config.sites) {
      if (config.checks[site] != null) {
        (function(site) {
          console.log("Checking \"" + site + "\" with a GET request...");
          request({
            uri: site,
            method: 'GET'
          }, function(error, response, body) {
            if (error) {
              console.log("Oh noes! \"" + site + "\" returned an error:");
              console.log(error);
              site_down(site, error);
            } else if (response.statusCode != 200) {
              console.log("Oh noes! \"" + site + "\" returned a " + response.statusCode + ".");
              site_down(site, response.statusCode);
            } else if (response.body.indexOf(config.checks[site]) == -1) {
              console.log("Oh noes! \"" + site + "\" did not return \"" + config.checks[site] + "\".");
              site_down(site, response.statusCode, "Text \"" + config.checks[site] + "\" not found in response. Response was:\n\n" + response.body);
            } else {
              console.log("Got back " + response.statusCode + " for \"" + site + "\".");
              site_up(site);
            }
          });
        })(site);
      } else {
        (function(site) {
          console.log("Checking \"" + site + "\" with a HEAD request...");
          request({
            uri: site,
            method: 'HEAD'
          }, function(error, response, body) {
            if (error) {
              console.log("Oh noes! \"" + site + "\" returned an error:");
              console.log(error);
              site_down(site, error);
            } else if (response.statusCode != 200) {
              console.log("Oh noes! \"" + site + "\" returned a " + response.statusCode + ".");
              site_down(site, response.statusCode);
            } else {
              console.log("Got back " + response.statusCode + " for \"" + site + "\".");
              site_up(site);
            }
          });
        })(site);
      }
    }
  }

  down_time = function(site) {
    ms = (new Date()) - config.sites[site];
    seconds = ms / 1000;
    minutes = parseInt(seconds / 60); seconds -= (60 * minutes);
    hours = parseInt(minutes / 60); minutes -= (60 * hours);

    r = "";
    if (Math.round(hours)) r += Math.round(hours) + " hours";
    if (Math.round(minutes)) { if (r != "") r += ", "; r += Math.round(minutes) + " minutes"; }
    if (Math.round(seconds)) { if (r != "") r += ", "; r += Math.round(seconds) + " seconds"; }
    return r;
  }

  site_down = function(site, error, failure) {
    text = "";
    if (isNaN(error)) {
      //  We have an error string or object here.
      text = "Error encountered while requesting " + site + ":\n" + error.toString();
    } else if (typeof failure !== "undefined") {
      text = failure;
    } else {
      //  We just have a bad response code.
      text = "Server returned an HTTP " + error + ".";
    }

    //  Send email to user informing them their site is down.
    console.log("Sending email to inform user that " + site + " is down.");
    postage.sendMessage({ 
      recipients: config.recipients,
      subject: "Oh noes! " + url.parse(site).hostname + " is down!",
      from: config.sender + "+" + Math.round(Math.random() * 100) + "@" + config.sender_domain,
      content: {
          'text/plain': 'Notifyay just noticed an error at ' + site + ".\n" + text + "\n"
                        + "That URL went down between " +
                        (new Date(new Date() - config.interval * 60 * 1000)).toString()
                        + " and " + (new Date()).toString() + "."
      }
    });

    config.sites[site] = new Date();
  }

  site_up = function(site) {
    //  Was the site previously down?
    if (config.sites[site] instanceof Date) {
      console.log("Sending email to inform user that " + site + " is back up.");
      postage.sendMessage({ 
        recipients: config.recipients,
        subject: "Huzzah! " + url.parse(site).hostname + " is back up!",
        from: config.sender + "+" + Math.round(Math.random() * 100) + "@" + config.sender_domain,
        content: {
            'text/plain': 'Notifyay just noticed that ' + site + " is back up.\n" + 
                          "It went down at " + config.sites[site].toString() +
                          ", and was down for " + down_time(site) + "."
        },
      });
    }
    config.sites[site] = true;
  }
}

switch (process.argv[2]) {
    case "start":
        daemon.start();
        break;
    case "stop":
        daemon.stop();
        break;
    default:
        run();
}
