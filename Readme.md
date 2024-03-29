# knockoutcrud
A knockoutjs extension to crud items in Observables and Observable Arrays

Inspired by "A Simple Editor Pattern for Knockout.js" by Ryan Niemeyer (http://www.knockmeout.net/2013/01/simple-editor-pattern-knockout-js.html).  Thank you Ryan!  It was one paragraph in this blog that go me thinking:
"If you were going to reuse this technique [the editor pattern] often, then you could even create an extension to an observableArray that adds the appropriate observables and functions off of the observableArray itself like in this [sample](http://jsfiddle.net/rniemeyer/MQVr3/)."

## Features
* For editing an array of objects within an `ObservableArray` and those object properties, as `observables`, at the same time
* Broadcasting of updates via `arrayChange`
* Programmable form field focus
* Plays nicely alongside other plugins like Knockout Validation

## How it works
* Adds [Custom Functions](http://knockoutjs.com/documentation/fn.html) to the `Observable` and `ObservableArray`.

## Demo
http://antonythorpe.github.io/knockoutcrud - a Todo App, of course!

## Tests
http://antonythorpe.github.io/knockoutcrud/tests/SpecRunner

## Coding Requirements
* A constructor function for each Observable Array
* An update function within the constructor function
For example:
```js
var SpaceExploration = function(data) {
    this_id = ko.observable();
    this.name = ko.observable();
    this.price = ko.observable();
    this.update(data);
};

ko.utils.extend(SpaceExploration.prototype, {  // Note: can also extend the prototype
    update: function(data) {
        this._id(data.id || "");
        this.name(data.name || "New item");
        this.price(data.price || 0);
    }
});
```
This separates creation from initialisation.  Fresh data can be applied at any time.

## Installation
```sh
bower install https://github.com/AntonyThorpe/knockoutcrud.git --save
```
Or
```sh
npm install knockoutcrud --save
```
Include `knockoutcrud.js` after loading `knockout`.
```js
import ko from 'knockout';
import 'knockoutcrud';
```

## Configuration
To load the methods and properties against an Observable Array initiate by:
```js
this.spaceExploration = ko.observableArray().crud({
    constructor: SpaceExploration,
    uniqueIdentifier: "_id"
});
```
The unique identifier is needed if utilising the `upsert` and `justUpdated`functions.

## Focus
### Method added to Observables
* `focusable`: use to select a form field that you need focused after pageload or an event. 
```js
this.inputField = ko.observable().focusable(/* optional: true */);  // in constructor

// then later
this.inputField.focused(true);
```
And, in html:
```html
<input data-bind="textInput: inputField, hasFocus: inputField.focused" />
```
Or, sneaky shortcut if there is only one item in the form that needs focus:
```html
<input data-bind="textInput: inputField, hasFocus: true" />
```

## Editing a whole Observable Array
### Methods added to Observable Arrays
* `insert`: to add new records to a collection.  This method needs an array or single object of items to push.
* `upsert`: to add or update records in a collection.  This method needs an array/object of items to push/update (must contain the unique identifier to be able to find objects to update).
* `deleteItem`: remove an instance from an edited collection (and adds it to `justRemoved` Observable Array for later reference)
* `cancelEdit`: roll back the collection to what it was originally

### Properties added to Observable Arrays
* `beforeEdit`: hold a copy of the original collection for running through upon cancel
* `justRemoved`: parked removed instances held temporary incase of cancellation of a collection edit.  Automatically populated when calling `deleteItem`.
* `justAdded`: parked added instances held temporary incase of cancellation of a collection edit
The reason for `justRemoved` and `justAdded` properties is to speed up the cancel step.  This is quicker than finding the difference betweeen the start and end points before cancelling.
Added objects need to be manually pushed to `justAdded`.
* `justUpdated`: get what has changed.  Finds the deep difference between the current Observable Array and `beforeEdit`.  This function returns a 'previous' and 'value' properties for comparison.  The `beforeEdit` must be populated for this to work.

## Editing an object within an Observable Array
### Methods added to Observable Arrays
* `selectItem`: populates `selectedItem`(see below) and provides a clean copy of the item for editing to the `itemForEditing` observable.
* `acceptItem`: accepts the changes and updates the original object.  It then publishes the change to 'arrayChange', which can be subscribed to.
* `revertItem`: cancel changes to the object by clearing `selectedItem` and `itemForEditing`.
* `removeItem`: remove the item currently being edited and then clears `selectedItem` and `itemForEditing`.

### Properties added to Observable Arrays
* `selectedItem`: holds the original object (an Observable).  In effect, a copy of 'this'.  Don't set its value directly, use `selectItem` so that `itemForEditing` can be populated with a clean object for editing.
The `selectedItem` can be used like `this.yourObservableArray.selectedItem().update(updatedData);`
* `itemForEditing`: a clean copy for editing.  Populate by using `selectItem`.
* `itemForAdding`: handy for when a second form is needed during an active editing process.

## Adding an object to an Observable Array
Adding is different from editing so provide `itemForAdding` for holding a protected observable whilst entering.  The `cancelAdd` method is used for throwing this away.
### Methods added to Observable Arrays
* `cancelAdd`: clears `itemForAdding`

### Properties added to Observable Arrays
* `itemForAdding`: An observable for holding a potential addition to an observable array.

## Pro Tip: Updating the Server after CRUD Operations
* Upon saving the CRUD operations, call `justRemoved`, `justAdded`, and then `justUpdated` on the Observable Array to provide a full set of data needed to forward to the server.
* Or, update the server as things change:
```javascript
spaceExploration.subscribe(function(newValue) {
    console.log(newValue);  // returns an array of objects with properties: index, previous (for updates) and value (current value of item)
}, null, "arrayChange");

```

## Requirements
* [Knockout](http://knockoutjs.com/index.html)

## Links
* Also see editable feature in [ko.plus](http://stevegreatrex.github.io/ko.plus/).  This is a great plugin for Knockout with similar outcomes.

## Support
None sorry.

## Change Log
[File](changelog.md)

## License
[MIT](LICENSE)
