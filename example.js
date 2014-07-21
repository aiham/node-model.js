var model = require('./model.js'),
    mysql = require('mysql');

// Define the models

var Blog = model('blogs', ['title', 'body']);
var Comment = model('comments', ['blog_id', 'name', 'message']);
model.oneToMany(Blog, Comment, 'blog', 'comments');

// Connect to the MySQL database

var db = mysql.createConnection({
  host: 'localhost',
  user: 'username',
  password: 'password',
  database: 'database'
});
db.connect();

// Populate the database

var firstBlog = new Blog(db, {
  title: 'My First Blog post',
  body: "Here's some text to go into my blog.\nMore text goes here, yep."
});
firstBlog.save(function () {

  var firstComment = new Comment(db, {
    blog_id: firstBlog.id,
    name: 'Aiham',
    message: 'I agree with the author'
  });
  firstComment.save();

  var secondComment = new Comment(db, {
    blog_id: firstBlog.id,
    name: 'John',
    message: 'I however disagree!'
  });
  secondComment.save();

});

var secondBlog = new Blog(db, {
  title: 'Another Blog Post',
  body: "I've decided to write another blog post.\nHere's the second line.\nAmazing, here's a third."
});
secondBlog.save();

// Count rows in table

Comment.count(db, {name: 'Aiham'}, function (count) {

  console.log(count + ' comments by Aiham have been made');

});

// Get all related rows

var firstBlog = new Blog(db, {id: 1});
firstBlog.get(function () {

  firstBlog.comments(function (comments) {

    for (var i = 0, l = comments.length; i < l; i++) {
      console.log(comments[i].name + ' says: ' + comments[i].message);
    }

  });

});
