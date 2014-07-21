# model.js

model.js is a simple ORM (Object Relational Mapper) for use with Node.js and MySQL.

## Requirements

- [Node.js][]
- [node-mysql][]
- [MySQL][]

[Node.js]: http://nodejs.org/
[node-mysql]: https://github.com/felixge/node-mysql/
[MySQL]: http://www.mysql.com/

## Usage

### Define models

Create a model object by using the `model()` function. It takes the following arguments:

- *tableName* - The name of the database table
- *fields* - A list of field names not including `id`

It is assumed all tables have a primary key named `id` of type INT with auto increment.

```js
var User = model('users', ['name', 'email']);
```

### Connect to the database

Use the `mysql` module to connect to the database.

```js
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database'
});
db.connect();
```

### Save a row

Use the `save()` function to save a row into the table. If the row has not been saved before, it will be assigned an `id` automatically.

```js
var john = new User(db, {name: 'John', email: 'john@example.com'});
john.save(function () {

  console.log(john.id);

});
```

### Retrieve a row

Use the `get()` function to retrieve a row from the table. Currently you can only retrieve rows by their `id`.

```js
var user_id = 1;
var theUser = new User(db, {id: user_id});
theUser.get(function () {

  console.log('Your user name: ', theUser.name);

});
```

### Access row data

Convert a row into an object literal using the `data()` function.

```js
var userData = theUser.data(); // {id: 1, name: 'John', email: 'john@example.com'}
```


### Update a row

Use the `setData()` function to update a row's data.

```js
theUser.setData({name: 'Michael', email: 'michael@example.com'});
theUser.save();
```

Or use a field's property to update a single field.

```js
theUser.name = 'Michael';
theUser.save();
```

### Remove a row

Use the `remove()` function to delete a row from a table.

```js
var theUser = new User(db, {id: 1});
theUser.remove();
```

### Count rows

Use the `count()` function to count rows in a table by any equality condition.

```js
User.count(db, {name: 'John'}, function (count) {

  console.log('Number of users named John: ', count);

});
```

### Define relationships

Define the relationship between model objects using the `model.oneToMany()` function. It takes the following arguments:

- `parentModel` - The 'One' in the relationship
- `childModel` - The 'Many' in the relationship
- `parentName` - The method name to access the parent from a child
- `childrenName` - The method name to access the list of children from the parent
- `childModelField` (optional) - The field name in the child corresponding to the parent id. If not specified, it is assumed to be `parentName` + `_id`

```js
var User = model('users', ['name', 'email']);
var Post = model('posts', ['user_id', 'message']);
model.oneToMany(User, Post, 'user', 'posts'); // childModelField becomes user_id
```

Currently One To Many relationships are the only type of relationship implemented in model.js.

### Save related rows

```js
var john = new User(db, {id: 1});
john.get(function () {

  var firstPost = new Post(db, {user_id: john.id, message: 'Hello'});
  firstPost.save();

});
```

### Retrieve related rows

Get all of a user's posts:

```js
var john = new User(db, {id: 1});
john.get(function () {

  john.posts(function (posts) {
  
    for (var i = 0, l = posts.length; i < l; i++) {
      console.log(john.name + ' says: ' + posts[i].message);
    }
  
  });

});
```

Or get the user of a post:

```js
var post = new Post(db, {id: 1});
post.get(function () {

  post.user(function (user) {

    console.log(user.name + ' says: ' + post.message);

  });

});
```
