const functions = require('firebase-functions');

//Create the .rss feed parser
let Parser = require('rss-parser');

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
    dialogflow,
    MediaObject,
    Image,
    Confirmation,
    List,
    Suggestions
} = require('actions-on-google');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

//Create the Options Constants
const EPISODE_ONE = 'episode_one';
const EPISODE_TWO = 'episode_two';
const EPISODE_THREE = 'episode_three';


/**
 * Welcome Intent
 */
app.intent('Welcome Intent', (conv) => {
  // If the device does NOT have a screen, 
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))  {
    //If the user DOES NOT have audio playback capability
    if(!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO'))
    {
      conv.close("So sorry, this device does not support media playback!");
      return;
    }
    else
    {
      //Prompt the user to play the latest episode
      conv.ask("Greetings, Learner!");
      //Use a Confirmation Helper for a yes/no question
      conv.ask(new Confirmation("Would you like to play the latest episode?"));
    }
  }
  else  {
    //Display a List of the 3 most recent podcasts
    
    //Create a parser for the .rss feed
    let parser = new Parser()
    
    //Use a promise, when the feed is parsed then...
    return parser.parseURL('https://www.raywenderlich.com/feed/podcast').then((feed) => {
      
      //Assign the most recent episodes to variables
      let cast1 = feed.items[0];
      let cast2 = feed.items[1];
      let cast3 = feed.items[2];

      //Output a simple response
      conv.ask("Here are the three latest episodes!");
      
      // Create and display a list of the 3 most recent episodes
      conv.ask(new List({
        title: 'Latest Episodes',
        items: {
          // Add the first episode to the list
          [EPISODE_ONE]: {
            synonyms: ['Podcast 1'],
            title: cast1.title,
            description: cast1.description,
            image: new Image({
              url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
              alt: 'RW Podcast Logo',
            }),
          },
          // Add the second episode to the list
          [EPISODE_TWO]: {
            synonyms: ['Podcast 2'],
            title: cast2.title,
            description: cast2.description,
            image: new Image({
              url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
              alt: 'RW Podcast Logo',
            }),
          },
          // Add the third episode to the list
          [EPISODE_THREE]: {
            synonyms: ['Podcast 3'],
            title: cast3.title,
            description: cast3.description,
            image: new Image({
              url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
              alt: 'RW Podcast Logo',
            }),
          },
        },
      }));

      //Add some suggestion chips for other related tasks that can be chosen
      conv.ask(new Suggestions(['Latest episode', 'Episode about Kotlin','Episode about iOS']));
  
    }).catch((err) => {
      // handle errors
      console.log(err)
      conv.close("An Error Occurred Parsing the RSS Feed, Try Again Later");
    });
  }  
});




/**
 * Confirmation Intent - Play the Latest Episode? Yes/No 
 */
app.intent('play_latest_episode_confirmation', (conv, input, confirmation) => {
  // if the user indicated yes to play the latest episode
  if (confirmation) {
    //play the latest episode

    //Create a parser for the .rss feed
    let parser = new Parser()
    
    //Use a promise, when the feed is parsed then...
    return parser.parseURL('https://www.raywenderlich.com/feed/podcast').then((feed) => {
      //Assign the most recent podcast to a variable
      let latestCast = feed.items[0];
      
      //simple response
      conv.ask('Here is the latest episode');

      //Create a media object that will play the episode
      conv.close(new MediaObject({
        name: latestCast.name,
        url: latestCast['enclosure']['url'],
        description: latestCast.description,
        icon: new Image({
          url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
          alt: 'RW Logo',
        }),
      }));
    }).catch((err) => {
      // handle errors
      console.log(err)
      conv.close("An Error Occurred Parsing the RSS Feed, Try Again Later");
  });
  } else {
    //The user declined to play the latest episode
    conv.ask("You can say 'play latest episode' or 'play an episode about a subject' such as kotlin or iOS.");
  }
})

/**
 * Intent: get_episode_option
 * Handle the Selected List Option and Play the Corresponding Episode
 */
app.intent('get_episode_option', (conv, input, option) => {
   
   //Use a promise, when the feed is parsed then...
   let parser = new Parser()

   return parser.parseURL('https://www.raywenderlich.com/feed/podcast').then((feed) => {
    
    //Assign the most recent episodes to variables
    let cast1 = feed.items[0];
    let cast2 = feed.items[1];
    let cast3 = feed.items[2];

    //Play the episode corresponding with the option they selected from the list
    if(option === EPISODE_THREE)
    {
      conv.ask('Here is episode three');
      conv.close(new MediaObject({
        name: cast3.title,
        url: cast3['enclosure']['url'],
        description: cast3.description,
        icon: new Image({
          url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
          alt: 'RW Logo',
        }),
      }));
    }
    else if(option === EPISODE_TWO)
    {
      conv.ask('Here is episode two');
      conv.close(new MediaObject({
        name: cast2.title,
        url: cast2['enclosure']['url'],
        description: cast2.description,
        icon: new Image({
          url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
          alt: 'RW Logo',
        }),
      }));
    }
    else
    {
      conv.ask('Here is episode one');
      conv.close(new MediaObject({
        name: cast1.title,
        url: cast1['enclosure']['url'],
        description: cast1.description,
        icon: new Image({
          url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
          alt: 'RW Logo',
        }),
      }));
    }
  }).catch((err) => {
     // handle errors
     console.log(err)
     conv.close("An Error Occurred Parsing the RSS Feed, Try Again Later");
  });
});


/**
 * Intent: play_the_latest_episode
 * Plays the latest episode from the feed
 */
app.intent('play_the_latest_episode', (conv) => {
  //Create a parser for the .rss feed
  let parser = new Parser()

  //Use a promise, when the feed is parsed then...
  return parser.parseURL('https://www.raywenderlich.com/feed/podcast').then((feed) => {
    //Assign the most recent podcast to a variable
    let latestCast = feed.items[0];
    
    conv.ask('Here is the latest episode');
    conv.close(new MediaObject({
      name: latestCast.name,
      url: latestCast['enclosure']['url'],
      description: latestCast.description,
      icon: new Image({
        url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
        alt: 'RW Logo',
      }),
    }));
  }).catch((err) => {
    // handle errors
    console.log(err)
    conv.close("An Error Occurred Parsing the RSS Feed, Try Again Later");
  });

});

/**
 * Intent: play_an_episode_about
 * Plays an episode about a certain subject
 */

app.intent('play_an_episode_about', (conv, {Subject}) => {
  //Create a parser for the .rss feed
  let parser = new Parser()

  //Use a promise, when the feed is parsed then...
  return parser.parseURL('https://www.raywenderlich.com/feed/podcast').then((feed) => {
    //Assign the most recent podcast to a variable
    //if no casts are found by the subject it will
    //play the latest episode by default
    let latestCast = feed.items[0];
    console.log('subject ' + Subject);

    //Find the subject
    feed.items.forEach(function(entry) {
      if(entry.title.toUpperCase().indexOf(Subject.toUpperCase()) > -1)
      {
        latestCast = entry;
      }
    })

    //Play the cast
    conv.ask(latestCast.title);
    conv.close(new MediaObject({
      name: latestCast.name,
      url: latestCast['enclosure']['url'],
      description: latestCast.description,
      icon: new Image({
        url: 'https://koenig-media.raywenderlich.com/uploads/2016/02/Logo.png',
        alt: 'RW Logo',
      }),
    }));
  }).catch((err) => {
    // handle errors
    console.log(err)
    conv.close("An Error Occurred Parsing the RSS Feed, Try Again Later");
  });
});


// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
