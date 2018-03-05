/**
 * Klaviyo email templating prototype. Uses the Revealing Module Pattern
 * (https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript)
 * to contain all of the application logic, which is organized in a simple vanilla MVC pattern.
 *
 * @author Adam Conrad <me@conradadam.com>
 * @namespace Klaviyo
 * @param {Object} d - Safely pass in the DOM to prevent modification and easier shorthand.
 * @param {Object} ls - Safely pass in localStorage and provide an easy, short variable for it.
 * @returns {Object} - The public functions to expose to the global scope for starting the application.
 */
window.Klaviyo = (function(d, ls){
  'use strict';

  /**
   * Enums for template block types.
   * @readonly
   * @enum {number}
   */
  var TEXT = 1
    , IMAGE = 2
    , DIVIDER = 3
    , LOCAL_STORAGE_KEY = 'klaviyo-email-template';

  /**
   * MVC component declarations.
   *
   * @constant {Object} templateModel - A simple in-memory store of the template blocks, backed up via localStorage.
   *
   * @constant {Object} templateController - Represents the gluing functions to connect the model and view,
   * specifically so that they never have to directly talk to each other, and thus highlights how MVC excels in
   * separating concerns.
   *
   * @constant {Object} templateView - Handles all of the DOM-related activities, such as event handling,
   * DOM manipulation, and rendering of the actual HTML.
   */
  var templateModel, templateView, templateController;

  templateController = {
    /**
     * Adds a template block to the model object (and localStorage) and re-renders the view.
     *
     * @param {Object} templateElement - The element object to add to the model array
     * @param {number=} index - (optional) The index where the template element should be inserted into the array
     * @returns {number} - The index of the newly-created element
     */
    addTemplateElement: function(templateElement, index){
      if (index != undefined) {
        templateModel.splice(index + 1, 0, templateElement);
      } else {
        templateModel.push(templateElement);
      }

      ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templateModel));
      templateView.render();

      return index != undefined ? index + 1 : templateModel.length;
    }
    /**
     * Copies the block to the next element in the collection and re-renders the view.
     *
     * @param {number} id - The numeric ID of the template block to be copied
     */
  , copyBlock: function(id){
      templateController.addTemplateElement(templateController.getTemplateElement(id), id);
      templateView.render(true);
    }
    /**
     * Removes the block from the model collection and re-renders the view.
     *
     * @param {number} id - The numeric ID of the template block to be removed
     */
  , deleteBlock: function(id){
      templateController.removeTemplateElement(id);
      templateView.render();
    }
    /**
     * Renders the editor by setting the active block element to modify and rendering the view in editor mode.
     *
     * @param {number} id - The numeric ID of the template block to be activated for the editor to modify
     */
  , editBlock: function(id){
      templateController.setActiveElement(id);
      templateView.render(true);
    }
    /**
     * Retrieves the template element block that is active in the editor.
     *
     * @returns {Object} - The template element block that is active
     */
  , getActiveElement: function(){
      return templateModel.filter(function(element){ return element.active; })[0];
    }
    /**
     * Retrieves the template element block by a specific index from the array.
     *
     * @returns {Object} - The template element block requested
     */
  , getTemplateElement: function(index){
      return templateModel[index];
    }
    /**
     * Retrieves the entire model of template block elements.
     *
     * @returns {Object[]} - The model, a collection of template element blocks
     */
  , getTemplateElements: function(){
      return templateModel;
    }
    /**
     * Initializes the model and view and is the only function exposed to the global scope.
     *
     * @public
     */
  , init: function(){
      templateModel = JSON.parse(ls.getItem(LOCAL_STORAGE_KEY)) || [
        {
          active: false
        , type: TEXT
        , value: '<header><h1>September 2015 Newsletter</h1></header>'
        }
      , {
          active: false
        , type: IMAGE
        , value: 'img.jpg'
        }
      , {
          active: false
        , type: TEXT
        , value: "<p>This email contains some exciting Red Sox news. The season may be almost over, but we're still" +
              "excited for what's happened in the last month.</p>" +
            "<h2>Big Papi Closing in on 500</h2>" +
            "<p>David Ortiz is almost at 500 career home runs! He hit numbers 496, 497 and 498 just in the last week.</p>" +
            "<h2>Young Players Getting Playing Time</h2>" +
            "<p>Since the Red Sox are officially eliminated from postseason contention, we've called up a number of" +
              "Paw Sox players to make their major league debuts! If you're interested in what the future of the" +
              "Red Sox looks like, check out a game in September.</p>" +
            "<h2>Buy Tickets for 2016</h2>" +
            "<p>This year may have been a bust, but remember when the Red Sox went worst to first? That's next year!</p>"
        }
      , {
          active: false
        , type: DIVIDER
        , value: undefined
        }
      , {
          active: false
        , type: TEXT
        , value: '<footer>If you hate the Red Sox, then you might want to <a href="#">unsubscribe</a>.</footer>'
        }
      ];
      templateView.init();
    }
    /**
     * Removes the template element from the model / localStorage. Re-renders after the model is updated.
     *
     * @param {number} id - The numeric ID of the template block to be removed
     */
  , removeTemplateElement: function(id){
      templateModel.splice(id, 1);
      ls.setItem( LOCAL_STORAGE_KEY, JSON.stringify( templateModel ) );
      templateView.render();
    }
    /**
     * Sets the template element to be used with the editor as active and in use.
     *
     * @param {number} id - The numeric ID of the template block to be activated
     */
  , setActiveElement: function(id){
      templateModel.forEach(function(element){ element.active = false; });
      templateModel[id].active = true;
      ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templateModel));
    }
    /**
     * Updates the template block with the new content modified via the editor. Re-renders the view to display
     * the new content on the main template view.
     *
     * @param {string} content - String representation of the HTML to be placed into the active template block element
     */
  , updateTemplate: function(content){
      templateController.getActiveElement().value = content;
      ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templateModel));
      templateView.render(true);
    }
  };

  templateView = {
    /**
     * Helper function just to make sure drag continues to happen by preventing default DOM behavior.
     *
     * @param {Event} event - The event to intercept and allow the drag-and-drop to continue properly
     */
    allowDrop: function(event){
      event.preventDefault();
    }
    /**
     * Function designed to help keep track of what element is being dragged.
     *
     * @param {Event} event - The event to store the ID of the dragged element
     */
  , dragNewTemplateElement: function(event){
      event.dataTransfer.setData('template-type', event.target.id);
    }
    /**
     * The callback to insert the new element block when the dragged editor element is dropped into the template view.
     *
     * @param {Event} event - The event on which contains the information about what element block was dropped
     */
  , drop: function(event){
      event.preventDefault();

      if (event.dataTransfer.getData('template-type').match(/text/)) {
        templateController.setActiveElement(
          templateController.addTemplateElement({
            active: false // I know we're about to set this active but the active method also clears out the others
          , type: TEXT
          , value: '<p>New text</p>'
          }
          , +event.target.parentElement.dataset.index || templateController.getTemplateElements().length)
        );
        templateView.render(true);
      }
    }
    /**
     * Initializes the view by declaring all of the events and firing off the rendering engine.
     */
  , init: function(){
      var emailTemplate = d.getElementById('email-template');

      /**
       * I actually wanted to use vanilla event delegation here but bubbling up to find the template element
       * is more effort than it's worth for a project with a short timeline, so I sacrificed performance for ease.
       *
       * @todo candidate for event delegation
       */
      [].slice.call(d.querySelectorAll('.template-element')).forEach(function(element){
        element.addEventListener('dragstart', templateView.dragNewTemplateElement);
      });
      emailTemplate.addEventListener('dragover', templateView.allowDrop);
      emailTemplate.addEventListener('drop', templateView.drop);

      d.getElementById('close-editor').addEventListener('click', function(event){
        templateView.toggleElements('template-editor', 'template-elements');
      });

      d.getElementById('update-template').addEventListener('click', function(event){
        templateController.updateTemplate(d.getElementById('active-text').value);
      });

      d.getElementById('bold').addEventListener('click', function(){
        templateView.insertFormatting('<strong></strong>');
      });

      d.getElementById('italic').addEventListener('click', function(){
        templateView.insertFormatting('<em></em>');
      });

      d.getElementById('underline').addEventListener('click', function(){
        templateView.insertFormatting('<u></u>');
      });

      templateView.render();
    }
    /**
     * Helper function to insert the formatting text from the buttons in the editor.
     *
     * @param {NodeItem} el - The DOM element (textarea) where the cursor is inserting text
     * @param {string} val - The string of HTML to be inserted into the element
     */
  , insertAtCursor: function(el, val) {
      var end = el.selectionEnd; // need to cache for cursor repositioning

      if (el.selectionStart || el.selectionStart === '0') {
        el.value = el.value.substring(0, el.selectionStart) + val + el.value.substring(el.selectionEnd, el.value.length);
      } else {
        el.value += val;
      }

      el.focus();
      el.selectionEnd = end + parseInt(val.length / 2, 10);
    }
    /**
     * Insert formatting HTML text into the textarea and simultaneously updating the model in localStorage.
     *
     * @param {string} element - The HTML element (string representation) to be inserted into the block
     */
  , insertFormatting: function(element){
      templateView.insertAtCursor(d.getElementById('active-text'), element);
      templateController.updateTemplate(d.getElementById('active-text').value);
    }
    /**
     * Takes the template model in as data and spits out an HTML string representing all of the saved elements.
     * @todo This if/else by type (case statement) is prime for refactoring via Strategy Pattern where we could
     *       create a parent class of template strategies, and then subclasses for each strategy type listed below.
     */
  , populateViewHtml: function() {
      return templateController.getTemplateElements().reduce(function(htmlStr, currentTemplateElement, currentIndex) {
        if (currentTemplateElement.type === DIVIDER) {
          return htmlStr + '<div class="block" data-index="' + currentIndex + '">' +
            templateView.uiControls() + '<hr/></div>';
        } else if (currentTemplateElement.type === IMAGE) {
          return htmlStr + '<div class="block" data-index="' + currentIndex + '">' +
            templateView.uiControls() + '<img src="' + currentTemplateElement.value + '"/></div>';
        } else if (currentTemplateElement.type === TEXT) {
          return htmlStr + '<div class="block" data-index="' + currentIndex + '">' +
            templateView.uiControls() + currentTemplateElement.value + '</div>';
        }
      }, '');
    }
    /**
     * Renders the model data onto the page.
     *
     * @param {boolean} editorMode - Whether or not to show the editor or the list of drag/drop block elements.
     */
  , render: function(editorMode){
      d.getElementById('email-template').innerHTML = templateView.populateViewHtml();

      /**
       * Can only add these events after the blocks have been added to the DOM and rendered.
       *
       * @todo Candidates for event delegation; possibly some refactoring via metaprogramming very similar functions
       */
      [].slice.call(d.querySelectorAll('.block')).forEach(function(block){
        block.addEventListener('click', function(event){
          templateController.editBlock(+event.currentTarget.dataset.index);
        })
      });
      [].slice.call(d.querySelectorAll('.js-edit-block')).forEach(function(editBtn){
        editBtn.addEventListener('click', function(event){
          event.stopPropagation();
          templateController.editBlock(+event.currentTarget.parentElement.parentElement.parentElement.dataset.index);
        });
      });
      [].slice.call(d.querySelectorAll('.js-copy-block')).forEach(function(copyBtn){
        copyBtn.addEventListener('click', function(event){
          event.stopPropagation();
          templateController.copyBlock(+event.currentTarget.parentElement.parentElement.parentElement.dataset.index);
        });
      });
      [].slice.call(d.querySelectorAll('.js-delete-block')).forEach(function(deleteBtn){
        deleteBtn.addEventListener('click', function(event){
          event.stopPropagation();
          templateController.deleteBlock(+event.currentTarget.parentElement.parentElement.parentElement.dataset.index);
        });
      });

      if (editorMode) {
        templateView.toggleElements('template-elements', 'template-editor');
        d.getElementById('active-text').value = templateController.getActiveElement().value;
      } else {
        templateView.toggleElements('template-editor', 'template-elements');
      }
    }
    /**
     * Convenience function to toggle elements as visible/hidden.
     *
     * @param {string} hideId - ID of the DOM element to hide
     * @param {string} showId - ID of the DOM element to show
     */
  , toggleElements: function(hideId, showId) {
      d.getElementById(hideId).classList.add('hidden');
      d.getElementById(showId).classList.remove('hidden');
    }
    /**
     * String builder to construct the UI controls for editing blocks when you hover over them.
     *
     * @returns {string} - The DOM element containing the UI controls
     */
  , uiControls: function() {
      return '<ul class="ui-controls">' +
          '<li><button class="js-edit-block" type="button">Edit</button></li>' +
          '<li><button class="js-copy-block" type="button">Copy</button></li>' +
          '<li><button class="js-delete-block" type="button">Delete</button></li>' +
        '</ul>';
    }
  };

  return { init: templateController.init };
})(document, localStorage);

Klaviyo.init();
