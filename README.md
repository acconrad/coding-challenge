# Klaviyo Code Challenge

This is my interpretation to the Klaviyo takehome front-end coding challenge. Feel free to explore the code and have a look around!

## Getting Started

Open `index.html` in your browser to run the app, everything is already included in the right places. If you want to reset the template to the original state, simply open up the console and type `localStorage.clear();` and hit enter and that will reset everything.

## Architectural Overview

Since this is a front-end challenge, the obvious technologies were HTML5, CSS3, and JavaScript. There was no debating HTML5, and given how simple the prototype was, I felt it was unnecessary to require a CSS preprocessor like LESS or SCSS, but in a production project, I would absolutely use one. As for JavaScript, this was my toughest decision for the whole application: given you are a React shop, I considered this framework, but ultimately I decided on ES5 for two primary reasons:

1. **I knew this could be done with native JavaScript events and methods:** The challenge was simple enough that even seemingly complicated things like drag-and-drop already have had native event support since IE9. I strongly believe frameworks and plugins are powerful, but only when they are absolutely necessary. If you remove the comments, the entire app is around 200 lines of JavaScript. React is over 100kb; why insert ten of thousands of lines of JavaScript for a 200-line app? That didn't seem worth it.
2. **Browser support was unspecified, so I chose to maximize support:** The only hint was to save the methods via `localStorage`, which has been available since IE8. So we know we don't need to support anything older than that. Essentially all of ES5 is implemented in IE9, whereas ES6, for all of it's greatness, is largely not supported in IE 9-11 and requires polyfills (read: hundreds of KBs) just to get it off of the ground. Again, why add in Babel for an app that can be written in 200 lines or so?

With that overall structure, the majority of the application logic was within the JavaScript, whose design decisions I will discuss in the next section.

## Design Decisions

### HTML

I used HTML5 and turned on responsive within the `<head>`. Feel free to shrink and grow the browser, this thing works at any size. I also opted for semantic HTML and a proper hierarchy for the sake of accessibility, so I'll prefer an `<aside>` for the side menu editor over simply a `<div>`. Standard best practices apply as well - such as inserting the CSS in the `<head>` and the JS at the end of the `<body>` to not prevent the JS from blocking rendering of the HTML elements.

### CSS

Standard CSS3 with one block of inserted "vendor" code to reset the browser stylings via the Meyer CSS reset. I generally like to organize elements first by native DOM elements (`h1` or `body`), then alphabetically by the class name, and then add in the responsive media queries at the end. I put these at the end because this supports a mobile-first design - by designing for mobile devices first, the media queries act as an override to fill in additional design changes when the screen size grows, rather than using media queries as a band-aid for mobile designs (often called desktop-first design). Organizing it this way makes it very easy to read and find particular classes (and properties). I made a few rare exceptions (like `.block:hover .ui-controls`) if I thought it was better grouped with another set of component functionality. In a larger app, the CSS would be broken up by component and organized via a preprocessor like LESS or SCSS.

### JavaScript

As mentioned above, I went with vanilla ES5 JavaScript for maximum browser compatibility, performance, and minimal code setup. ES5 is not that bad, and with the addition of functions like `querySelectorAll`, it is very close to on par with jQuery. The one area jQuery would have been nice was a `closest` function to find the nearest parent when bubbling up the DOM to find the block elements, but again, it seemed like overkill for a prototype to import jQuery for one function. If we were to build out the editor on the left into something truly production-worthy, the first plugin I would add in is something like [Quill](https://quilljs.com) or [TinyMCE](https://www.tinymce.com) to add in far more than bold, italic, and underline. Also, one of the first corrections I would make to the app, with more time, would be to abstract away the HTML from the text. My method was the quick-and-dirty solution (and also not exactly the safest thing to be injecting raw HTML into a page), but combined with a plugin editor like the one above, that would make adding text a bit more intuitive.

The overview of the application and all of the functionality behind that code is largely already covered in the JSDocs embedded into the `app.js` file, so I'd encourage you to explore that file since it would be redundant to cover it here again.

## What? No Tests?

So I actually had set up a test suite, which you can easily do with vanilla JavaScript by using `console.log` to track your progress on the tests and `console.assert` to catch anything that breaks in the meantime, but I quickly ran into one of the only downsides of the Revealing Module Pattern for JavaScript. Since it only _reveals_ to the public (global scope) functions that were added to the return object, that also means anything you want to test has to be revealed as well. In a production app, you're probably only going to want to reveal the `init()` function (one exception would be something like a utility class that's a series of helper functions, in which case you'd want to expose all of them), otherwise revealing everything would sort of defeat the purpose of the pattern. If this were production Klaviyo code, since it would be written as a series of React components, I'd likely use Jest to test my components, which would resolve this concern, but for the sake of this takehome exercise, I can say I've manually tested each of the actions that I've written in the browsers I have available on my laptop.
