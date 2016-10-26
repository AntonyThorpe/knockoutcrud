describe("Adding and retrieving items from Todo List: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList
	});

	beforeEach(function() {
		todoList.removeAll();
	});

	it("Adding a single item to list should have length of one", function() {
		todoList.insert({
			task: "blastoff",
			completed: true
		});
		expect(todoList().length).toEqual(1);
	});

	it("Adding a single item in an array to list should have length of one", function() {
		todoList.insert([{
			task: "blastoff",
			completed: true
		}]);
		expect(todoList().length).toEqual(1);
	});

	it("Adding two items to list should have a length of two", function() {
		todoList.insert([{
			task: "counting down",
			completed: true
		}, {
			task: "blastoff"
		}]);
		expect(todoList().length).toEqual(2);
	});
});


describe("Removing Item from Todo List: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList
	});
	var todoListOther = ko.observableArray().crud({
		constructor: TodoList
	});

	beforeEach(function() {
		todoList.removeAll();
		todoListOther.removeAll();
		todoList.insert([{
			task: "start your engines",
			completed: true
		}, {
			task: "counting down"
		}, {
			task: "blastoff"
		}]);
	});


	it("Removing item from list should reduce its size", function() {
		var instance = todoList()[1];
		todoList.deleteItem(instance);
		expect(todoList().length).toEqual(2);
	});

	it("Removing an item that doesn't exist from a todo should not change list length", function() {
		var unrelatedInstance = todoListOther.insert({
			task: "Crash"
		});
		todoList.deleteItem(unrelatedInstance);
		expect(todoList().length).toEqual(3);
	});
});


describe("Upserting items: ", function() {
	var todoList = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	});

	beforeEach(function() {
		todoList.removeAll();
		todoList.insert([{
			task: "start your engines",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			task: "blastoff"
		}]);
	});

	it("Adding a new items should increase TodoList length", function() {
		todoList.upsert({
			task: "we have lift off"
		});
		expect(todoList().length).toEqual(4);
		var findInstance = ko.utils.arrayFilter(todoList(), function(item) {
			return item.task() === "we have lift off";
		});
		expect(findInstance).not.toBeNull();
		expect(findInstance[0].task()).toBe("we have lift off");
	});

	it("Editing an item should not increase todoList length and update an item", function() {
		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(todoList()[1].task()).toBe("counting down 123");
		expect(todoList().length).toEqual(3);
	});

	it("Editing an item, by passing in an array, should not increase todoList length and update an item", function() {
		todoList.upsert([{
			_id: "123",
			task: "counting down 123"
		}]);
		expect(todoList()[1].task()).toBe("counting down 123");
		expect(todoList().length).toEqual(3);
	});

	it("Adding an item, with a new id, should increase todoList length and create an item", function() {
		todoList.upsert({
			_id: "777",
			task: "Brand new id"
		});
		expect(todoList()[3].task()).toBe("Brand new id");
		expect(todoList().length).toEqual(4);
	});

	it("Adding an item, with a new id and passed in through an array, should increase todoList length and create a new item", function() {
		todoList.upsert([{
			_id: "777",
			task: "Brand new id"
		}]);
		expect(todoList()[3].task()).toBe("Brand new id");
		expect(todoList().length).toEqual(4);
	});

	it("Adding one item and editing another item should increase todoList length and update an item", function() {
		todoList.upsert([{
			task: "we have lift off"
		}, {
			_id: "123",
			task: "counting down 123"
		}]);
		expect(todoList().length).toEqual(4);
		expect(todoList()[1].task()).toBe("counting down 123");
	});
});

describe("Publication of updates: ", function() {

	it("Changes to an item are published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "123",
			task: "counting down"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(changes[0].value.task).toBe("counting down 123");
	});

	it("Where no changes in an object, nothing is published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "1234",
			task: "ignition"
		});
		expect(changes).toBeUndefined();
	});

	it("Changes within an array return the correct index number and the previous object", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);
		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "123",
			task: "counting down 123"
		});
		expect(changes[0].index).toEqual(1);
		expect(changes[0].previous.task).toBe("counting down");
	});

	it("Where no changes in an array, nothing is published", function() {
		var todoList = ko.observableArray().crud({
			constructor: TodoList,
			uniqueIdentifier: "_id"
		});
		var changes;
		todoList.insert([{
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		}]);

		todoList.subscribe(function(newValue) {
			changes = newValue;
		}, null, "arrayChange");

		todoList.upsert({
			_id: "111",
			task: "we have lift off",
			completed: true
		}, {
			_id: "123",
			task: "counting down"
		}, {
			_id: "1234",
			task: "ignition"
		});
		expect(changes).toBeUndefined();
	});


});